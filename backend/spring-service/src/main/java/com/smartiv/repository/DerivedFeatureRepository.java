package com.smartiv.repository;

import com.smartiv.entity.DerivedFeature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;

public interface DerivedFeatureRepository extends JpaRepository<DerivedFeature, Long> {
    Page<DerivedFeature> findByBed_IdAndTimestampBetweenOrderByTimestampDesc(
            Long bedId, Instant from, Instant to, Pageable pageable);
}
