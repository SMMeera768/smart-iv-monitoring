package com.smartiv.repository;

import com.smartiv.entity.IvEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface IvEventRepository extends JpaRepository<IvEvent, Long> {

    /** Find the currently open (non-resolved) event for a bed. Used for debouncing. */
    Optional<IvEvent> findTopByBed_IdAndStatusNotOrderByStartTimeDesc(
            Long bedId, IvEvent.EventStatus status);

    Page<IvEvent> findByBed_IdOrderByStartTimeDesc(Long bedId, Pageable pageable);

    @Query("SELECT e FROM IvEvent e WHERE " +
           "(:bedId IS NULL OR e.bed.id = :bedId) AND " +
           "(:eventType IS NULL OR e.eventType = :eventType) AND " +
           "(:status IS NULL OR e.status = :status) " +
           "ORDER BY e.startTime DESC")
    Page<IvEvent> findFiltered(
            @Param("bedId") Long bedId,
            @Param("eventType") IvEvent.EventType eventType,
            @Param("status") IvEvent.EventStatus status,
            Pageable pageable);
}
