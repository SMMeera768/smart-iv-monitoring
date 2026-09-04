package com.smartiv.service.event;

import com.smartiv.dto.response.EventResponse;
import com.smartiv.entity.IvEvent;
import com.smartiv.repository.IvEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventService {

    private final IvEventRepository eventRepository;

    public EventService(IvEventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public Page<IvEvent> getEvents(Long bedId, IvEvent.EventType eventType, IvEvent.EventStatus status, Pageable pageable) {
        return eventRepository.findFiltered(bedId, eventType, status, pageable);
    }

    @Transactional(readOnly = true)
    public IvEvent getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
    }

    public EventResponse toDto(IvEvent event) {
        EventResponse dto = new EventResponse();
        dto.setId(event.getId());
        dto.setEventUuid(event.getEventUuid());
        dto.setBedCode(event.getBed() != null ? event.getBed().getBedCode() : null);
        dto.setDeviceCode(event.getDevice() != null ? event.getDevice().getDeviceCode() : null);
        dto.setEventType(event.getEventType() != null ? event.getEventType().name() : null);
        dto.setDetectedAt(event.getDetectedAt());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setDurationMs(event.getDurationMs());
        dto.setSeverity(event.getSeverity() != null ? event.getSeverity().name() : null);
        dto.setEvidenceScore(event.getEvidenceScore());
        dto.setExplanation(event.getExplanation());
        dto.setTriggeringFeatures(event.getTriggeringFeatures());
        dto.setStatus(event.getStatus() != null ? event.getStatus().name() : null);
        dto.setAcknowledgedBy(event.getAcknowledgedBy() != null ? event.getAcknowledgedBy().getUsername() : null);
        dto.setAcknowledgedAt(event.getAcknowledgedAt());
        dto.setResolvedBy(event.getResolvedBy() != null ? event.getResolvedBy().getUsername() : null);
        dto.setResolvedAt(event.getResolvedAt());
        return dto;
    }
}
