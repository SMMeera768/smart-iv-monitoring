package com.smartiv.state;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.entity.Bed;
import com.smartiv.repository.BedRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Spring singleton that holds one BedRuntimeState per bed.
 * Initialised from the database on startup.
 *
 * Each bed has its own isolated state — Bed 1 and Bed 2 never share windows.
 */
@Component
public class BedStateManager {

    private static final Logger log = LoggerFactory.getLogger(BedStateManager.class);

    private final BedRepository bedRepository;
    private final SmartIvProperties props;
    private final ConcurrentHashMap<String, BedRuntimeState> states = new ConcurrentHashMap<>();

    public BedStateManager(BedRepository bedRepository, SmartIvProperties props) {
        this.bedRepository = bedRepository;
        this.props = props;
    }

    @PostConstruct
    public void init() {
        int windowSize = props.getSignal().getFeatureWindow() * 2;
        for (Bed bed : bedRepository.findAll()) {
            states.put(bed.getBedCode(), new BedRuntimeState(bed.getBedCode(), windowSize));
            log.info("Initialised runtime state for bed {}", bed.getBedCode());
        }
    }

    /**
     * Returns the runtime state for a bed, creating one if it doesn't exist.
     * This handles beds added after startup.
     */
    public BedRuntimeState getState(String bedCode) {
        return states.computeIfAbsent(bedCode, code ->
                new BedRuntimeState(code, props.getSignal().getFeatureWindow() * 2));
    }

    /** Returns all current bed states — used by DeviceHealthService. */
    public Collection<BedRuntimeState> getAllStates() {
        return states.values();
    }
}
