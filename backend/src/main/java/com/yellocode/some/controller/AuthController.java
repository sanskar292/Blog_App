package com.yellocode.some.controller;

import com.yellocode.some.dto.AuthRequest;
import com.yellocode.some.dto.AuthResponse;
import com.yellocode.some.model.User;
import com.yellocode.some.repository.UserRepository;
import com.yellocode.some.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles /api/auth/register and /api/auth/login.
 * Both endpoints are public (no JWT required) as declared in SecurityConfig.
 *
 * Existing users are fully preserved:
 *  - Same BCrypt encoder → stored passwords are valid unchanged.
 *  - Same users table and username field.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authManager,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authManager    = authManager;
        this.jwtUtil        = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        // Basic validation
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return error(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return error(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }

        // Duplicate check
        if (userRepository.findByUsername(request.getUsername().trim()).isPresent()) {
            return error(HttpStatus.CONFLICT, "Username is already taken");
        }

        // Persist new user
        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        userRepository.save(user);

        // Return a JWT immediately so the frontend can log in without a second round trip
        String token = jwtUtil.generateToken(user.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token));
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return error(HttpStatus.BAD_REQUEST, "Username and password are required");
        }

        try {
            // Delegates to DaoAuthenticationProvider → BCrypt verify → works with existing users
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername().trim(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return error(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String token = jwtUtil.generateToken(request.getUsername().trim());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}