package com.yellocode.some.controller;

import com.yellocode.some.dto.AuthRequest;
import com.yellocode.some.dto.AuthResponse;
import com.yellocode.some.model.User;
import com.yellocode.some.repository.UserRepository;
import com.yellocode.some.security.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication Controller - Handles user registration and login.
 * 
 * Endpoints:
 * - POST /api/auth/register: Register a new user
 * - POST /api/auth/login: Authenticate existing user
 * - POST /api/auth/refresh: Refresh an expired access token
 * 
 * Security Features:
 * - Input validation with @Valid annotation
 * - BCrypt password encoding
 * - JWT token generation (access + refresh tokens)
 * - Duplicate username prevention
 * - Comprehensive error handling
 * 
 * Backward Compatibility:
 * - Same registration flow with immediate token return
 * - Same login flow with AuthenticationManager
 * - Same BCrypt password encoding
 * - Existing users can login without changes
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/register - Register a new user
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Register a new user account.
     * 
     * Validation Rules:
     * - Username: 3-50 characters, required
     * - Password: 6-100 characters, required
     * 
     * Response:
     * - 201 Created with JWT token on success
     * - 400 Bad Request on validation failure
     * - 409 Conflict on duplicate username
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        log.info("Registration attempt for username: {}", request.getUsername());

        // Trim and validate username
        String username = request.getUsername().trim();
        
        // Check for duplicate username
        if (userRepository.findByUsername(username).isPresent()) {
            log.warn("Registration failed - username already taken: {}", username);
            return errorResponse(HttpStatus.CONFLICT, "Username is already taken");
        }

        // Create and save new user
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER"); // Default role for new users
        
        userRepository.save(user);
        log.info("Successfully registered new user: {}", username);

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(username);
        String refreshToken = jwtUtil.generateRefreshToken(username);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(accessToken, refreshToken));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/login - Authenticate user
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Authenticate user with username and password.
     * 
     * Flow:
     * 1. Validate input credentials
     * 2. Authenticate using Spring Security AuthenticationManager
     * 3. Generate and return JWT tokens
     * 
     * Response:
     * - 200 OK with JWT tokens on success
     * - 400 Bad Request on missing credentials
     * - 401 Unauthorized on invalid credentials
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        log.info("Login attempt for username: {}", request.getUsername());

        String username = request.getUsername().trim();

        try {
            // Authenticate credentials using DaoAuthenticationProvider
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.getPassword())
            );

            log.info("Successfully authenticated user: {}", username);

            // Generate tokens
            String accessToken = jwtUtil.generateAccessToken(username);
            String refreshToken = jwtUtil.generateRefreshToken(username);

            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken));

        } catch (BadCredentialsException e) {
            log.warn("Failed login attempt - invalid credentials for username: {}", username);
            return errorResponse(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/auth/refresh - Refresh access token
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Refresh an expired access token using a valid refresh token.
     * 
     * Flow:
     * 1. Validate refresh token
     * 2. Extract username from refresh token
     * 3. Generate new access token
     * 
     * Response:
     * - 200 OK with new access token
     * - 401 Unauthorized on invalid/expired refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || refreshToken.isBlank()) {
            return errorResponse(HttpStatus.BAD_REQUEST, "Refresh token is required");
        }

        try {
            // Validate refresh token
            JwtUtil.TokenValidationResult validation = jwtUtil.validateToken(refreshToken);
            
            if (!validation.isValid()) {
                log.warn("Token refresh failed - invalid refresh token: {}", validation.errorMessage());
                return errorResponse(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
            }

            // Verify it's actually a refresh token
            String tokenType = jwtUtil.extractTokenType(refreshToken);
            if (!"refresh".equals(tokenType)) {
                log.warn("Token refresh failed - token is not a refresh token");
                return errorResponse(HttpStatus.UNAUTHORIZED, "Invalid token type");
            }

            String username = validation.username();
            
            // Generate new access token
            String newAccessToken = jwtUtil.generateAccessToken(username);
            
            log.info("Successfully refreshed access token for user: {}", username);
            
            return ResponseEntity.ok(new AuthResponse(newAccessToken, refreshToken));

        } catch (Exception e) {
            log.error("Error during token refresh: {}", e.getMessage());
            return errorResponse(HttpStatus.UNAUTHORIZED, "Token refresh failed");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build a standardized error response.
     */
    private ResponseEntity<Map<String, String>> errorResponse(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
