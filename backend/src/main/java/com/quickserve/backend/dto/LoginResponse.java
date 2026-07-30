package com.quickserve.backend.dto;

import com.quickserve.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long id;
    private String username;
    private String fullName;
    private Role role;
    
    // A JWT token would normally go here, but omitted per requirements for now.
    private String message;
}
