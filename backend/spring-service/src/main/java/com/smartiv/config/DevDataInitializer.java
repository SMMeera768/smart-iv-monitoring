package com.smartiv.config;

import com.smartiv.entity.Bed;
import com.smartiv.entity.Calibration;
import com.smartiv.entity.Device;
import com.smartiv.entity.User;
import com.smartiv.repository.BedRepository;
import com.smartiv.repository.CalibrationRepository;
import com.smartiv.repository.DeviceRepository;
import com.smartiv.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
public class DevDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataInitializer.class);

    private final DeviceRepository deviceRepository;
    private final BedRepository bedRepository;
    private final CalibrationRepository calibrationRepository;
    private final UserRepository userRepository;

    public DevDataInitializer(DeviceRepository deviceRepository,
                              BedRepository bedRepository,
                              CalibrationRepository calibrationRepository,
                              UserRepository userRepository) {
        this.deviceRepository = deviceRepository;
        this.bedRepository = bedRepository;
        this.calibrationRepository = calibrationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // 1. Device: ESP32_01
        Device device = deviceRepository.findByDeviceCode("ESP32_01").orElseGet(() -> {
            Device d = new Device();
            d.setDeviceCode("ESP32_01");
            d.setHardwareType("ESP32");
            d.setFirmwareVersion("v1.0.0");
            d.setDeviceStatus(Device.DeviceStatus.ONLINE);
            d.setLastSeenAt(Instant.now());
            d.setActive(true);
            Device saved = deviceRepository.save(d);
            log.info("Initialized default device: ESP32_01");
            return saved;
        });

        // 2. Bed 1
        Bed bed1 = bedRepository.findByBedCode("BED_1").orElseGet(() -> {
            Bed b = new Bed();
            b.setBedCode("BED_1");
            b.setName("Bed 1");
            b.setCurrentDevice(device);
            b.setActive(true);
            Bed saved = bedRepository.save(b);
            log.info("Initialized default bed: BED_1");
            return saved;
        });

        // 3. Bed 2
        Bed bed2 = bedRepository.findByBedCode("BED_2").orElseGet(() -> {
            Bed b = new Bed();
            b.setBedCode("BED_2");
            b.setName("Bed 2");
            b.setCurrentDevice(device);
            b.setActive(true);
            Bed saved = bedRepository.save(b);
            log.info("Initialized default bed: BED_2");
            return saved;
        });

        // 4. Calibrations for both channels
        if (calibrationRepository.findTopByBed_IdAndChannelIdAndActiveTrueOrderByCalibratedAtDesc(bed1.getId(), "HX711_1").isEmpty()) {
            Calibration c1 = new Calibration();
            c1.setBed(bed1);
            c1.setDevice(device);
            c1.setChannelId("HX711_1");
            c1.setCalibrationFactor(1.0);
            c1.setZeroOffset(0.0);
            c1.setNotes("Default initial calibration");
            c1.setActive(true);
            calibrationRepository.save(c1);
            log.info("Initialized default calibration for BED_1 / HX711_1");
        }

        if (calibrationRepository.findTopByBed_IdAndChannelIdAndActiveTrueOrderByCalibratedAtDesc(bed2.getId(), "HX711_2").isEmpty()) {
            Calibration c2 = new Calibration();
            c2.setBed(bed2);
            c2.setDevice(device);
            c2.setChannelId("HX711_2");
            c2.setCalibrationFactor(1.0);
            c2.setZeroOffset(0.0);
            c2.setNotes("Default initial calibration");
            c2.setActive(true);
            calibrationRepository.save(c2);
            log.info("Initialized default calibration for BED_2 / HX711_2");
        }

        // 5. Admin user
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@smartiv.local");
            admin.setPasswordHash("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y");
            admin.setRole(User.Role.ADMINISTRATOR);
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Initialized default admin user");
        }
    }
}
