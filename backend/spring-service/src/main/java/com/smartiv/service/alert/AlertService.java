package com.smartiv.service.alert;

import com.smartiv.engine.RuleContext;
import com.smartiv.engine.RuleResult;
import com.smartiv.entity.*;
import com.smartiv.repository.AlertRepository;
import com.smartiv.repository.AuditLogRepository;
import com.smartiv.repository.IvEventRepository;
import com.smartiv.service.evidence.EvidenceScoreService;
import com.smartiv.state.BedRuntimeState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

/**
 * Manages the event and alert lifecycle.
 *
 * Key rules:
 *   - One open event per bed at a time (debounced — not one per cycle)
 *   - One open alert per event
 *   - NORMAL_FLOW resolves any open event
 *   - Alerts are never deleted — they are historical research data
 */
@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final IvEventRepository eventRepository;
    private final AlertRepository alertRepository;
    private final AuditLogRepository auditLogRepository;

    public AlertService(IvEventRepository eventRepository,
                        AlertRepository alertRepository,
                        AuditLogRepository auditLogRepository) {
        this.eventRepository = eventRepository;
        this.alertRepository = alertRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Called once per processing cycle.
     * Handles event state transitions and alert creation without creating
     * a new database record every cycle.
     */
    @Transactional
    public void handleEventCycle(Bed bed, Device device,
                                  RuleResult ruleResult,
                                  EvidenceScoreService.EvidenceResult evidence,
                                  RuleContext ctx,
                                  BedRuntimeState state) {

        IvEvent.EventType newType = ruleResult.getDeterminedEventType();
        Long openEventId = state.getCurrentOpenEventId();

        // Resolve open event if type changed to NORMAL_FLOW
        if (newType == IvEvent.EventType.NORMAL_FLOW && openEventId != null) {
            resolveOpenEvent(openEventId, ctx.getNow());
            state.setCurrentOpenEventId(null);
            return;
        }

        // Skip NORMAL_FLOW — no alert needed
        if (newType == IvEvent.EventType.NORMAL_FLOW) return;

        // Only create a new event when confirmed and no open event of same type
        if (!ruleResult.isCandidateConfirmed()) return;

        if (openEventId != null) {
            // Update evidence score on existing open event
            eventRepository.findById(openEventId).ifPresent(ev -> {
                ev.setEvidenceScore(evidence.getScore());
                ev.setExplanation(ruleResult.getExplanation());
                eventRepository.save(ev);
            });
            return;
        }

        // Create new event
        IvEvent event = new IvEvent();
        event.setBed(bed);
        event.setDevice(device);
        event.setEventType(newType);
        event.setStartTime(ctx.getEventCandidateStartTime() != null
                ? ctx.getEventCandidateStartTime() : ctx.getNow());
        event.setEvidenceScore(evidence.getScore());
        event.setExplanation(ruleResult.getExplanation());
        event.setSeverity(determineSeverity(newType, evidence.getScore()));
        event.setTriggeringFeatures(Map.of(
                "flowRate", ctx.getSmoothedFlowRate(),
                "weightSlope", ctx.getWeightSlope(),
                "evidenceScore", (double) evidence.getScore()
        ));
        IvEvent saved = eventRepository.save(event);
        state.setCurrentOpenEventId(saved.getId());

        // Create alert for non-normal events
        createAlert(bed, saved, evidence.getScore());

        // LOW_VOLUME coexisting flag — create separate alert if needed
        if (ruleResult.isLowVolumeFlag() && newType != IvEvent.EventType.LOW_VOLUME) {
            createLowVolumeAlert(bed, saved);
        }

        log.info("New event created: {} for bed {} (evidence: {})",
                newType, bed.getBedCode(), evidence.getScore());
    }

    @Transactional
    public Alert acknowledgeAlert(Long alertId, String acknowledgedByUsername) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + alertId));

        if (alert.getStatus() == Alert.AlertStatus.RESOLVED) {
            throw new IllegalStateException("Cannot acknowledge a resolved alert");
        }

        alert.setStatus(Alert.AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(Instant.now());
        Alert saved = alertRepository.save(alert);

        auditLog("ALERT_ACKNOWLEDGED", "Alert", alertId, acknowledgedByUsername,
                bed(alert), "OPEN", "ACKNOWLEDGED");

        return saved;
    }

    @Transactional
    public Alert resolveAlert(Long alertId, String resolvedByUsername) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + alertId));

        alert.setStatus(Alert.AlertStatus.RESOLVED);
        alert.setResolvedAt(Instant.now());
        Alert saved = alertRepository.save(alert);

        auditLog("ALERT_RESOLVED", "Alert", alertId, resolvedByUsername,
                bed(alert), alert.getStatus().name(), "RESOLVED");

        return saved;
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Alert> getAlerts(Long bedId, Alert.AlertStatus status, org.springframework.data.domain.Pageable pageable) {
        return alertRepository.findFiltered(bedId, status, pageable);
    }

    @Transactional(readOnly = true)
    public Alert getAlertById(Long alertId) {
        return alertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + alertId));
    }

    public com.smartiv.dto.response.AlertResponse toDto(Alert a) {
        com.smartiv.dto.response.AlertResponse dto = new com.smartiv.dto.response.AlertResponse();
        dto.setId(a.getId());
        dto.setAlertUuid(a.getAlertUuid());
        dto.setBedCode(a.getBed() != null ? a.getBed().getBedCode() : null);
        dto.setAlertType(a.getAlertType());
        dto.setSeverity(a.getSeverity() != null ? a.getSeverity().name() : null);
        dto.setEvidenceScore(a.getEvidenceScore());
        dto.setMessage(a.getMessage());
        dto.setStatus(a.getStatus() != null ? a.getStatus().name() : null);
        dto.setCreatedAt(a.getCreatedAt());
        dto.setAcknowledgedAt(a.getAcknowledgedAt());
        dto.setAcknowledgedBy(a.getAcknowledgedBy() != null ? a.getAcknowledgedBy().getUsername() : null);
        dto.setResolvedAt(a.getResolvedAt());
        dto.setResolvedBy(a.getResolvedBy() != null ? a.getResolvedBy().getUsername() : null);
        return dto;
    }


    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void resolveOpenEvent(Long eventId, Instant now) {
        eventRepository.findById(eventId).ifPresent(ev -> {
            ev.setStatus(IvEvent.EventStatus.RESOLVED);
            ev.setEndTime(now);
            if (ev.getStartTime() != null) {
                ev.setDurationMs(now.toEpochMilli() - ev.getStartTime().toEpochMilli());
            }
            eventRepository.save(ev);

            // Resolve associated open alert
            alertRepository.findByEventAndStatus(ev, Alert.AlertStatus.OPEN)
                    .ifPresent(a -> {
                        a.setStatus(Alert.AlertStatus.RESOLVED);
                        a.setResolvedAt(now);
                        alertRepository.save(a);
                    });
            alertRepository.findByEventAndStatus(ev, Alert.AlertStatus.ACKNOWLEDGED)
                    .ifPresent(a -> {
                        a.setStatus(Alert.AlertStatus.RESOLVED);
                        a.setResolvedAt(now);
                        alertRepository.save(a);
                    });
        });
    }

    private void createAlert(Bed bed, IvEvent event, int evidenceScore) {
        // Prevent duplicate open alerts for the same event
        Optional<Alert> existing = alertRepository.findByEventAndStatus(event, Alert.AlertStatus.OPEN);
        if (existing.isPresent()) return;

        Alert alert = new Alert();
        alert.setBed(bed);
        alert.setEvent(event);
        alert.setAlertType(event.getEventType().name());
        alert.setSeverity(event.getSeverity());
        alert.setEvidenceScore(evidenceScore);
        alert.setMessage(buildAlertMessage(event.getEventType(), bed.getBedCode()));
        alertRepository.save(alert);
    }

    private void createLowVolumeAlert(Bed bed, IvEvent parentEvent) {
        Alert alert = new Alert();
        alert.setBed(bed);
        alert.setEvent(parentEvent);
        alert.setAlertType(IvEvent.EventType.LOW_VOLUME.name());
        alert.setSeverity(IvEvent.Severity.MEDIUM);
        alert.setEvidenceScore(70);
        alert.setMessage("Low remaining volume detected on " + bed.getBedCode()
                + ". Bag change may be required soon.");
        alertRepository.save(alert);
    }

    private IvEvent.Severity determineSeverity(IvEvent.EventType type, int evidenceScore) {
        return switch (type) {
            case FLOW_INTERRUPTION -> evidenceScore >= 80 ? IvEvent.Severity.HIGH : IvEvent.Severity.MEDIUM;
            case BAG_REPLACEMENT   -> IvEvent.Severity.LOW;
            case LOW_VOLUME        -> IvEvent.Severity.MEDIUM;
            default                -> IvEvent.Severity.LOW;
        };
    }

    private String buildAlertMessage(IvEvent.EventType type, String bedCode) {
        return switch (type) {
            case FLOW_INTERRUPTION ->
                    "Possible flow interruption detected on " + bedCode + ". Please review.";
            case BAG_REPLACEMENT ->
                    "Bag replacement detected on " + bedCode + ".";
            case LOW_VOLUME ->
                    "Low remaining volume on " + bedCode + ". Bag change may be required.";
            default -> "Event detected on " + bedCode + ": " + type.name();
        };
    }

    private String bed(Alert a) {
        return a.getBed() != null ? a.getBed().getBedCode() : "unknown";
    }

    private void auditLog(String action, String entityType, Long entityId,
                           String user, String bedCode,
                           String previousValue, String newValue) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId != null ? entityId.toString() : null);
        log.setBedCode(bedCode);
        log.setPreviousValue(previousValue);
        log.setNewValue(newValue);
        log.setResult("SUCCESS");
        auditLogRepository.save(log);
    }
}
