package com.smartiv.repository;

import com.smartiv.entity.BagSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BagSessionRepository extends JpaRepository<BagSession, Long> {
    Optional<BagSession> findByBed_IdAndActiveTrue(Long bedId);
}
