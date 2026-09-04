package com.smartiv.repository;

import com.smartiv.entity.Alert;
import com.smartiv.entity.IvEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    /** Used by AlertService to prevent duplicate open alerts for the same event. */
    Optional<Alert> findByEventAndStatus(IvEvent event, Alert.AlertStatus status);

    /** Count all non-resolved alerts (for dashboard summary). */
    long countByStatusNot(Alert.AlertStatus status);

    @Query("SELECT a FROM Alert a WHERE " +
           "(:bedId IS NULL OR a.bed.id = :bedId) AND " +
           "(:status IS NULL OR a.status = :status) " +
           "ORDER BY a.createdAt DESC")
    Page<Alert> findFiltered(
            @Param("bedId") Long bedId,
            @Param("status") Alert.AlertStatus status,
            Pageable pageable);
}
