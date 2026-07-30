package com.quickserve.backend.service;

import com.quickserve.backend.dto.CreateOwnerRequest;
import com.quickserve.backend.dto.LoginRequest;
import com.quickserve.backend.dto.LoginResponse;

public interface UserService {

    /**
     * Creates a new user with the OWNER role.
     *
     * @throws com.quickserve.backend.exception.DuplicateResourceException if the username already exists
     */
    void createOwner(CreateOwnerRequest request);

    /**
     * Authenticates a user by username and password.
     *
     * @throws IllegalArgumentException if authentication fails (invalid credentials)
     */
    LoginResponse authenticate(LoginRequest request);
}
