package com.smartiv.service.calibration;

import com.smartiv.dto.request.CalibrationRequest;
import com.smartiv.dto.response.CalibrationResponse;
import com.smartiv.entity.AuditLog;
import com.smartiv.entity.Bed;
import com.smartiv.entity.Calibration;
import com.smartiv.entity.User;
import com.smartiv.repository.AuditLogRepository;
import com.smartiv.repository.BedRepository;
import com.smartiv.repository.CalibrationRepository;
import com.smartiv.repository.UserRepository;
import com.smartiv.state.BedRuntimeState;
import com.smartiv.state.BedStateManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class CalibrationService {

    private final CalibrationRepository calibrationRepository;
    private final BedRepository bedRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final BedStateManager stateManager;

    public CalibrationService(CalibrationRepository calibrationRepository,
                              BedRepository bedRepository,
                              UserRepository userRepository,
                              AuditLogRepository auditLogRepository,
                              BedStateManager stateManager) {
        this.calibrationRepository = calibrationRepository;
        this.bedRepository = bedRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.stateManager = stateManager;
    }

    @Transactional(readOnly = true)
    public CalibrationResponse getCalibration(String bedCode) {
        Bed bed = bedRepository.findByBedCode(bedCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown bed: " + bedCode));

        return calibrationRepository.findTopByBed_BedCodeAndActiveTrueOrderByCalibratedAtDesc(bedCode)
                .map(this::toDto)
                .orElseGet(() -> {
                    CalibrationResponse empty = new CalibrationResponse();
                    empty.setBedCode(bedCode);
                    empty.setCalibrationFactor(1.0);
                    empty.setZeroOffset(0.0);
                    empty.setActive(false);
                    return empty;
                });
    }

    @Transactional
    public CalibrationResponse saveCalibration(String bedCode, CalibrationRequest req, String username) {
        Bed bed = bedRepository.findByBedCode(bedCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown bed: " + bedCode));

        User user = username != null ? userRepository.findByUsername(username).orElse(null) : null;

        Calibration cal = new Calibration();
        cal.setBed(bed);
        cal.setDevice(bed.getCurrentDevice());
        cal.setChannelId(req.getChannelId());
        cal.setCalibrationFactor(req.getCalibrationFactor());
        cal.setZeroOffset(req.getZeroOffset() != null ? req.getZeroOffset() : 0.0);
        cal.setKnownReferenceWeight(req.getKnownReferenceWeight());
        cal.setCalibratedBy(user);
        cal.setNotes(req.getNotes());
        cal.setActive(true);

        Calibration saved = calibrationRepository.save(cal);

        // Update runtime baseline/tare if applicable
        BedRuntimeState state = stateManager.getState(bedCode);
        state.setCurrentBaseline(null); // Force recalculation with new calibration

        // Audit log
        AuditLog log = new AuditLog();
        log.setAction("CALIBRATION_UPDATED");
        log.setEntityType("Calibration");
        log.setEntityId(saved.getId().toString());
        log.setUsername(username);
        log.setBedCode(bedCode);
        log.setNewValue("factor=" + req.getCalibrationFactor() + ", offset=" + req.getZeroOffset());
        log.setResult("SUCCESS");
        auditLogRepository.save(log);

        return toDto(saved);
    }

    @Transactional
    public CalibrationResponse tare(String bedCode, String username) {
        Bed bed = bedRepository.findByBedCode(bedCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown bed: " + bedCode));

        BedRuntimeState state = stateManager.getState(bedCode);
        Double currentRaw = state.getLatestRawWeight();
        double tareValue = currentRaw != null ? currentRaw : 0.0;

        Optional<Calibration> currentCal = calibrationRepository
                .findTopByBed_BedCodeAndActiveTrueOrderByCalibratedAtDesc(bedCode);

        Calibration cal = new Calibration();
        cal.setBed(bed);
        cal.setDevice(bed.getCurrentDevice());
        cal.setChannelId(currentCal.map(Calibration::getChannelId).orElse("HX711_1"));
        cal.setCalibrationFactor(currentCal.map(Calibration::getCalibrationFactor).orElse(1.0));
        cal.setZeroOffset(tareValue);
        cal.setNotes("Tare offset applied");
        cal.setActive(true);

        User user = username != null ? userRepository.findByUsername(username).orElse(null) : null;
        cal.setCalibratedBy(user);

        Calibration saved = calibrationRepository.save(cal);

        // Reset runtime baseline
        state.setCurrentBaseline(0.0);

        AuditLog log = new AuditLog();
        log.setAction("TARE_APPLIED");
        log.setEntityType("Calibration");
        log.setEntityId(saved.getId().toString());
        log.setUsername(username);
        log.setBedCode(bedCode);
        log.setNewValue("zeroOffset=" + tareValue);
        log.setResult("SUCCESS");
        auditLogRepository.save(log);

        return toDto(saved);
    }

    public CalibrationResponse toDto(Calibration c) {
        CalibrationResponse dto = new CalibrationResponse();
        dto.setId(c.getId());
        dto.setBedCode(c.getBed() != null ? c.getBed().getBedCode() : null);
        dto.setDeviceCode(c.getDevice() != null ? c.getDevice().getDeviceCode() : null);
        dto.setChannelId(c.getChannelId());
        dto.setCalibrationFactor(c.getCalibrationFactor());
        dto.setZeroOffset(c.getZeroOffset());
        dto.setKnownReferenceWeight(c.getKnownReferenceWeight());
        dto.setCalibratedAt(c.getCalibratedAt());
        dto.setCalibratedBy(c.getCalibratedBy() != null ? c.getCalibratedBy().getUsername() : null);
        dto.setNotes(c.getNotes());
        dto.setActive(c.isActive());
        return dto;
    }
}
