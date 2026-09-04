package com.smartiv.controller;

import com.smartiv.dto.request.ConfigurationRequest;
import com.smartiv.dto.response.ConfigurationResponse;
import com.smartiv.service.configuration.ConfigurationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configuration")
public class ConfigurationController {

    private final ConfigurationService configurationService;

    public ConfigurationController(ConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    @GetMapping
    public ResponseEntity<List<ConfigurationResponse>> getAll() {
        return ResponseEntity.ok(configurationService.getAllConfigurations());
    }

    @PutMapping
    public ResponseEntity<ConfigurationResponse> update(
            @Valid @RequestBody ConfigurationRequest request,
            @RequestParam(required = false, defaultValue = "admin") String username) {

        return ResponseEntity.ok(configurationService.updateConfiguration(request, username));
    }
}
