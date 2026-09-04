package com.smartiv.controller;

import com.smartiv.dto.response.BedStatusResponse;
import com.smartiv.dto.response.DashboardSummaryResponse;
import com.smartiv.service.dashboard.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * Dashboard endpoints — read-only, frontend-facing.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> summary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/bed/{bedCode}")
    public ResponseEntity<BedStatusResponse> bedStatus(@PathVariable String bedCode) {
        return ResponseEntity.ok(dashboardService.getBedStatus(bedCode));
    }

    @GetMapping("/bed/{bedCode}/readings")
    public ResponseEntity<List<DashboardService.ReadingPoint>> readings(
            @PathVariable String bedCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "200") int limit) {

        Instant resolvedFrom = from != null ? from : Instant.now().minusSeconds(3600);
        Instant resolvedTo   = to   != null ? to   : Instant.now();
        int safeLimit = Math.min(limit, 1000);

        return ResponseEntity.ok(dashboardService.getBedReadings(bedCode, resolvedFrom, resolvedTo, safeLimit));
    }
}
