package com.smartiv.service.analytics;

import com.smartiv.dto.response.AnalyticsResponse;
import com.smartiv.entity.Alert;
import com.smartiv.entity.IvEvent;
import com.smartiv.repository.AlertRepository;
import com.smartiv.repository.BedRepository;
import com.smartiv.repository.IvEventRepository;
import com.smartiv.state.BedRuntimeState;
import com.smartiv.state.BedStateManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final IvEventRepository eventRepository;
    private final AlertRepository alertRepository;
    private final BedRepository bedRepository;
    private final BedStateManager stateManager;

    public AnalyticsService(IvEventRepository eventRepository,
                            AlertRepository alertRepository,
                            BedRepository bedRepository,
                            BedStateManager stateManager) {
        this.eventRepository = eventRepository;
        this.alertRepository = alertRepository;
        this.bedRepository = bedRepository;
        this.stateManager = stateManager;
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics() {
        AnalyticsResponse res = new AnalyticsResponse();
        List<IvEvent> events = eventRepository.findAll();
        List<Alert> alerts = alertRepository.findAll();

        res.setTotalEvents(events.size());
        res.setNormalFlowEvents(events.stream().filter(e -> e.getEventType() == IvEvent.EventType.NORMAL_FLOW).count());
        res.setFlowInterruptionEvents(events.stream().filter(e -> e.getEventType() == IvEvent.EventType.FLOW_INTERRUPTION).count());
        res.setLowVolumeEvents(events.stream().filter(e -> e.getEventType() == IvEvent.EventType.LOW_VOLUME).count());
        res.setBagReplacementEvents(events.stream().filter(e -> e.getEventType() == IvEvent.EventType.BAG_REPLACEMENT).count());
        res.setSensorDriftEvents(events.stream().filter(e -> e.getEventType() == IvEvent.EventType.SENSOR_DRIFT).count());
        res.setSensorFailureEvents(events.stream().filter(e -> e.getEventType() == IvEvent.EventType.SENSOR_FAILURE).count());

        res.setTotalAlerts(alerts.size());
        res.setOpenAlerts(alerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.OPEN).count());
        res.setAcknowledgedAlerts(alerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.ACKNOWLEDGED).count());
        res.setResolvedAlerts(alerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.RESOLVED).count());

        double avgEvidence = events.stream()
                .mapToInt(IvEvent::getEvidenceScore)
                .average()
                .orElse(0.0);
        res.setAverageEvidenceScore(Math.round(avgEvidence * 10.0) / 10.0);

        // Average flow rate across active bed states
        double avgFlow = stateManager.getAllStates().stream()
                .filter(s -> s.getCurrentSmoothedFlowRate() != null)
                .mapToDouble(BedRuntimeState::getCurrentSmoothedFlowRate)
                .average()
                .orElse(0.0);
        res.setAverageFlowRateGPerMin(Math.round(avgFlow * 100.0) / 100.0);

        // Breakdown maps
        Map<String, Long> byBed = new HashMap<>();
        for (IvEvent e : events) {
            if (e.getBed() != null) {
                byBed.merge(e.getBed().getBedCode(), 1L, Long::sum);
            }
        }
        res.setEventsByBed(byBed);

        Map<String, Long> bySeverity = new HashMap<>();
        for (Alert a : alerts) {
            if (a.getSeverity() != null) {
                bySeverity.merge(a.getSeverity().name(), 1L, Long::sum);
            }
        }
        res.setAlertsBySeverity(bySeverity);

        return res;
    }
}
