package com.yellocode.some.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication response DTO - Returns JWT tokens to the client.
 * 
 * Contains:
 * - Access token: Used for authenticating API requests (7-day expiry)
 * - Refresh token: Used to obtain new access tokens (30-day expiry)
 * - Token type: Bearer (for Authorization header format)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String refreshToken;
    private String tokenType;

    /**
     * Constructor for backward compatibility - access token only.
     * Automatically sets token type to "Bearer".
     */
    public AuthResponse(String token) {
        this.token = token;
        this.tokenType = "Bearer";
    }

    /**
     * Constructor with both access and refresh tokens.
     */
    public AuthResponse(String token, String refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
    }
}
