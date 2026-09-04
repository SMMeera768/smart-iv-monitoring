package com.smartiv.repository;

import com.smartiv.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BedRepository extends JpaRepository<Bed, Long> {
    Optional<Bed> findByBedCode(String bedCode);
    Optional<Bed> findByBedCodeAndActiveTrue(String bedCode);
}
