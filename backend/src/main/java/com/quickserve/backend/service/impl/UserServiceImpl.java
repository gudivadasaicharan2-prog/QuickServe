package com.quickserve.backend.service.impl;

import com.quickserve.backend.dto.CreateOwnerRequest;
import com.quickserve.backend.dto.LoginRequest;
import com.quickserve.backend.dto.LoginResponse;
import com.quickserve.backend.entity.Role;
import com.quickserve.backend.entity.User;
import com.quickserve.backend.exception.DuplicateResourceException;
import com.quickserve.backend.repository.UserRepository;
import com.quickserve.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void createOwner(CreateOwnerRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("User", "username", request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .role(Role.OWNER)
                .enabled(true)
                .build();

        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException("Account is disabled");
        }

        return LoginResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }
}
