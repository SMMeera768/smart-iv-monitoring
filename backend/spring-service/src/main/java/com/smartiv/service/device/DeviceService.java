package com.smartiv.service.device;

import com.smartiv.dto.response.DeviceResponse;
import com.smartiv.entity.Bed;
import com.smartiv.entity.Device;
import com.smartiv.repository.BedRepository;
import com.smartiv.repository.DeviceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final BedRepository bedRepository;

    public DeviceService(DeviceRepository deviceRepository, BedRepository bedRepository) {
        this.deviceRepository = deviceRepository;
        this.bedRepository = bedRepository;
    }

    @Transactional(readOnly = true)
    public List<DeviceResponse> getAllDevices() {
        List<Bed> allBeds = bedRepository.findAll();
        return deviceRepository.findAll().stream()
                .map(d -> toDto(d, allBeds))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DeviceResponse getDeviceById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Device not found: " + id));
        List<Bed> allBeds = bedRepository.findAll();
        return toDto(device, allBeds);
    }

    private DeviceResponse toDto(Device d, List<Bed> allBeds) {
        DeviceResponse dto = new DeviceResponse();
        dto.setId(d.getId());
        dto.setDeviceCode(d.getDeviceCode());
        dto.setHardwareType(d.getHardwareType());
        dto.setFirmwareVersion(d.getFirmwareVersion());
        dto.setWifiStatus(d.getWifiStatus());
        dto.setDeviceStatus(d.getDeviceStatus() != null ? d.getDeviceStatus().name() : null);
        dto.setLastSeenAt(d.getLastSeenAt());
        dto.setRegisteredAt(d.getRegisteredAt());
        dto.setActive(d.isActive());

        List<String> beds = allBeds.stream()
                .filter(b -> b.getCurrentDevice() != null && b.getCurrentDevice().getId().equals(d.getId()))
                .map(Bed::getBedCode)
                .collect(Collectors.toList());
        dto.setAssociatedBeds(beds);
        return dto;
    }
}
