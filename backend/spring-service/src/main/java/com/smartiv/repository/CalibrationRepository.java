package com.smartiv.repository;

import com.smartiv.entity.Calibration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CalibrationRepository extends JpaRepository<Calibration, Long> {
    Optional<Calibration> findTopByBed_IdAndChannelIdAndActiveTrueOrderByCalibratedAtDesc(
            Long bedId, String channelId);

    Optional<Calibration> findTopByBed_BedCodeAndActiveTrueOrderByCalibratedAtDesc(
            String bedCode);
}
