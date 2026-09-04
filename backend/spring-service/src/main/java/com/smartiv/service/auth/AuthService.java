package com.smartiv.service.auth;

import com.smartiv.dto.request.LoginRequest;
import com.smartiv.dto.response.LoginResponse;
import com.smartiv.entity.AuditLog;
import com.smartiv.entity.User;
import com.smartiv.repository.AuditLogRepository;
import com.smartiv.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AuthService(UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByUsername(req.getUsername())
                .orElse(null);

        String role = user != null ? user.getRole().name() : "NURSE";
        String token = UUID.randomUUID().toString();

        AuditLog log = new AuditLog();
        log.setAction("LOGIN");
        log.setEntityType("User");
        log.setUsername(req.getUsername());
        log.setResult("SUCCESS");
        auditLogRepository.save(log);

        return new LoginResponse(token, req.getUsername(), role, "Login successful");
    }
}
