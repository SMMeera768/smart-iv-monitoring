package com.smartiv.controller;

import com.smartiv.dto.request.DeviceDataRequest;
import com.smartiv.service.ingestion.IngestionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * POST /api/device/data
 *
 * Receives sensor packets from the ESP32.
 * All processing is delegated to IngestionService — no business logic here.
 */
@RestController
@RequestMapping("/api/device")
public class DeviceDataController {

    private final IngestionService ingestionService;

    public DeviceDataController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping("/data")
    public ResponseEntity<Map<String, String>> ingest(@Valid @RequestBody DeviceDataRequest request) {
        ingestionService.processPacket(request);
        return ResponseEntity.ok(Map.of("status", "accepted"));
    }
}
