package com.smartiv.dto.request;

import jakarta.validation.constraints.NotBlank;

public class ConfigurationRequest {

    @NotBlank(message = "Configuration key is required")
    private String configKey;

    @NotBlank(message = "Configuration value is required")
    private String configValue;

    private String description;

    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }
    public String getConfigValue() { return configValue; }
    public void setConfigValue(String configValue) { this.configValue = configValue; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
