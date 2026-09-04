package com.smartiv.controller;

import com.smartiv.dto.response.EventResponse;
import com.smartiv.entity.IvEvent;
import com.smartiv.service.event.EventService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<Page<EventResponse>> getEvents(
            @RequestParam(required = false) Long bedId,
            @RequestParam(required = false) IvEvent.EventType eventType,
            @RequestParam(required = false) IvEvent.EventStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "startTime"));
        Page<EventResponse> events = eventService.getEvents(bedId, eventType, status, pageable).map(eventService::toDto);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{bedId}")
    public ResponseEntity<Page<EventResponse>> getBedEvents(
            @PathVariable Long bedId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "startTime"));
        Page<EventResponse> events = eventService.getEvents(bedId, null, null, pageable).map(eventService::toDto);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<EventResponse> getEventDetails(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.toDto(eventService.getEventById(id)));
    }
}
