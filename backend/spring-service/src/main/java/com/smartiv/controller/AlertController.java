package com.smartiv.controller;

import com.smartiv.dto.request.AlertActionRequest;
import com.smartiv.dto.response.AlertResponse;
import com.smartiv.entity.Alert;
import com.smartiv.service.alert.AlertService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<Page<AlertResponse>> getAlerts(
            @RequestParam(required = false) Long bedId,
            @RequestParam(required = false) Alert.AlertStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AlertResponse> alerts = alertService.getAlerts(bedId, status, pageable).map(alertService::toDto);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertResponse> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.toDto(alertService.getAlertById(id)));
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<AlertResponse> acknowledgeAlert(
            @PathVariable Long id,
            @RequestBody(required = false) AlertActionRequest request) {

        String user = request != null && request.getUserId() != null ? request.getUserId() : "system_nurse";
        Alert alert = alertService.acknowledgeAlert(id, user);
        return ResponseEntity.ok(alertService.toDto(alert));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<AlertResponse> resolveAlert(
            @PathVariable Long id,
            @RequestBody(required = false) AlertActionRequest request) {

        String user = request != null && request.getUserId() != null ? request.getUserId() : "system_nurse";
        Alert alert = alertService.resolveAlert(id, user);
        return ResponseEntity.ok(alertService.toDto(alert));
    }
}
