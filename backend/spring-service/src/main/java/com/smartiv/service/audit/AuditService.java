package com.smartiv.service.audit;

import com.smartiv.dto.response.AuditLogResponse;
import com.smartiv.entity.AuditLog;
import com.smartiv.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable).map(this::toDto);
    }

    public AuditLogResponse toDto(AuditLog log) {
        AuditLogResponse dto = new AuditLogResponse();
        dto.setId(log.getId());
        dto.setTimestamp(log.getTimestamp());
        dto.setUsername(log.getUsername() != null ? log.getUsername() : (log.getUser() != null ? log.getUser().getUsername() : null));
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setBedCode(log.getBedCode());
        dto.setPreviousValue(log.getPreviousValue());
        dto.setNewValue(log.getNewValue());
        dto.setResult(log.getResult());
        dto.setMetadata(log.getMetadata());
        return dto;
    }
}
