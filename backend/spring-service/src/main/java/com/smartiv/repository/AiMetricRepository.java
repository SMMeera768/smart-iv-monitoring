package com.smartiv.repository;

import com.smartiv.entity.AiMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AiMetricRepository extends JpaRepository<AiMetric, Long> {
    Optional<AiMetric> findTopByBed_IdOrderByTimestampDesc(Long bedId);
}
