package com.smartiv.service.configuration;

import com.smartiv.dto.request.ConfigurationRequest;
import com.smartiv.dto.response.ConfigurationResponse;
import com.smartiv.entity.AuditLog;
import com.smartiv.entity.SystemConfiguration;
import com.smartiv.entity.User;
import com.smartiv.repository.AuditLogRepository;
import com.smartiv.repository.ConfigurationRepository;
import com.smartiv.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConfigurationService {

    private final ConfigurationRepository configRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public ConfigurationService(ConfigurationRepository configRepository,
                                UserRepository userRepository,
                                AuditLogRepository auditLogRepository) {
        this.configRepository = configRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public List<ConfigurationResponse> getAllConfigurations() {
        return configRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConfigurationResponse getConfiguration(String key) {
        return configRepository.findByConfigKey(key)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Configuration not found: " + key));
    }

    @Transactional
    public ConfigurationResponse updateConfiguration(ConfigurationRequest req, String username) {
        SystemConfiguration config = configRepository.findByConfigKey(req.getConfigKey())
                .orElseGet(() -> {
                    SystemConfiguration sc = new SystemConfiguration();
                    sc.setConfigKey(req.getConfigKey());
                    return sc;
                });

        String previousValue = config.getConfigValue();
        config.setConfigValue(req.getConfigValue());
        if (req.getDescription() != null) {
            config.setDescription(req.getDescription());
        }

        User user = username != null ? userRepository.findByUsername(username).orElse(null) : null;
        config.setUpdatedBy(user);

        SystemConfiguration saved = configRepository.save(config);

        AuditLog log = new AuditLog();
        log.setAction("CONFIG_CHANGED");
        log.setEntityType("SystemConfiguration");
        log.setEntityId(saved.getId() != null ? saved.getId().toString() : null);
        log.setUsername(username);
        log.setPreviousValue(previousValue);
        log.setNewValue(req.getConfigValue());
        log.setResult("SUCCESS");
        auditLogRepository.save(log);

        return toDto(saved);
    }

    private ConfigurationResponse toDto(SystemConfiguration sc) {
        ConfigurationResponse dto = new ConfigurationResponse();
        dto.setId(sc.getId());
        dto.setConfigKey(sc.getConfigKey());
        dto.setConfigValue(sc.getConfigValue());
        dto.setDescription(sc.getDescription());
        dto.setUpdatedAt(sc.getUpdatedAt());
        dto.setUpdatedBy(sc.getUpdatedBy() != null ? sc.getUpdatedBy().getUsername() : null);
        return dto;
    }
}
