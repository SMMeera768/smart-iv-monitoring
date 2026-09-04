package com.smartiv.controller;

import com.smartiv.dto.request.CalibrationRequest;
import com.smartiv.dto.response.CalibrationResponse;
import com.smartiv.service.calibration.CalibrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calibration")
public class CalibrationController {

    private final CalibrationService calibrationService;

    public CalibrationController(CalibrationService calibrationService) {
        this.calibrationService = calibrationService;
    }

    @GetMapping("/{bedCode}")
    public ResponseEntity<CalibrationResponse> getCalibration(@PathVariable String bedCode) {
        return ResponseEntity.ok(calibrationService.getCalibration(bedCode));
    }

    @PostMapping("/{bedCode}")
    public ResponseEntity<CalibrationResponse> saveCalibration(
            @PathVariable String bedCode,
            @Valid @RequestBody CalibrationRequest request,
            @RequestParam(required = false, defaultValue = "biomed_engineer") String username) {

        return ResponseEntity.ok(calibrationService.saveCalibration(bedCode, request, username));
    }

    @PostMapping("/{bedCode}/tare")
    public ResponseEntity<CalibrationResponse> tare(
            @PathVariable String bedCode,
            @RequestParam(required = false, defaultValue = "biomed_engineer") String username) {

        return ResponseEntity.ok(calibrationService.tare(bedCode, username));
    }
}
