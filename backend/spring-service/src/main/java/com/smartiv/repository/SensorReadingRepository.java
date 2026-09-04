package com.smartiv.repository;

import com.smartiv.entity.SensorReading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    Page<SensorReading> findByBed_IdAndTimestampServerBetweenOrderByTimestampServerAsc(
            Long bedId, Instant from, Instant to, Pageable pageable);

    List<SensorReading> findByBed_IdAndTimestampServerBetweenOrderByTimestampServerDesc(
            Long bedId, Instant from, Instant to, Pageable pageable);

    Optional<SensorReading> findTopByBed_IdOrderByTimestampServerDesc(Long bedId);

    @Query("SELECT r FROM SensorReading r WHERE r.bed.id = :bedId AND r.valid = true ORDER BY r.timestampServer DESC")
    List<SensorReading> findRecentValidByBedId(@Param("bedId") Long bedId, Pageable pageable);
}
