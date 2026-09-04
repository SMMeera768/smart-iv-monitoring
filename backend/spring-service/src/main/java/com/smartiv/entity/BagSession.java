package com.smartiv.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bag_sessions")
public class BagSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_uuid", nullable = false, unique = true)
    private UUID sessionUuid = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @Column(name = "initial_weight", nullable = false)
    private double initialWeight;

    @Column(name = "baseline_weight", nullable = false)
    private double baselineWeight;

    @Column(name = "tare_weight", nullable = false)
    private double tareWeight = 0.0;

    @Column(name = "start_time", nullable = false)
    private Instant startTime = Instant.now();

    @Column(name = "end_time")
    private Instant endTime;

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public UUID getSessionUuid() { return sessionUuid; }
    public Bed getBed() { return bed; }
    public void setBed(Bed bed) { this.bed = bed; }
    public double getInitialWeight() { return initialWeight; }
    public void setInitialWeight(double initialWeight) { this.initialWeight = initialWeight; }
    public double getBaselineWeight() { return baselineWeight; }
    public void setBaselineWeight(double baselineWeight) { this.baselineWeight = baselineWeight; }
    public double getTareWeight() { return tareWeight; }
    public void setTareWeight(double tareWeight) { this.tareWeight = tareWeight; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
