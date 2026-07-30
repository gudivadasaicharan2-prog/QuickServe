package com.quickserve.backend.controller;

import com.quickserve.backend.dto.CreateOwnerRequest;
import com.quickserve.backend.dto.LoginRequest;
import com.quickserve.backend.dto.LoginResponse;
import com.quickserve.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * POST /api/auth/register-owner
     * Registers a new owner account.
     */
    @PostMapping("/register-owner")
    public ResponseEntity<Void> registerOwner(@Valid @RequestBody CreateOwnerRequest request) {
        userService.createOwner(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * POST /api/auth/login
     * Authenticates a user and returns a placeholder JWT response.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // Mapping invalid credentials directly to 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
