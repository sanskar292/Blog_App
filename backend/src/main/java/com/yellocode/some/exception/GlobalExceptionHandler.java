package com.yellocode.some.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for consistent error responses across the API.
 * 
 * Handles:
 * - Authentication errors (401 Unauthorized)
 * - Validation errors (400 Bad Request)
 * - Resource not found (404)
 * - Generic server errors (500)
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ─────────────────────────────────────────────────────────────────────────
    // Authentication Errors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handle bad credentials during login.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication failed: Invalid credentials");
        return errorResponse(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }

    /**
     * Handle general authentication exceptions.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication exception: {}", ex.getMessage());
        return errorResponse(HttpStatus.UNAUTHORIZED, "Authentication failed: " + ex.getMessage());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Validation Errors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handle @Valid annotation failures (DTO validation).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation failed: {}", errors);
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Handle constraint violation exceptions (e.g., @NotBlank, @Size).
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String propertyPath = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            errors.put(propertyPath, message);
        });

        log.warn("Constraint violation: {}", errors);
        return ResponseEntity.badRequest().body(errors);
    }

    /**
     * Handle missing request parameters.
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, String>> handleMissingParameter(
            MissingServletRequestParameterException ex) {
        
        log.warn("Missing request parameter: {}", ex.getParameterName());
        return errorResponse(HttpStatus.BAD_REQUEST, 
                "Missing required parameter: " + ex.getParameterName());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Resource Errors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handle 404 Not Found errors.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, String>> handleNoResourceFound(NoResourceFoundException ex) {
        log.debug("Resource not found: {}", ex.getMessage());
        return errorResponse(HttpStatus.NOT_FOUND, "Resource not found");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Generic Errors
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handle illegal argument exceptions.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /**
     * Handle illegal state exceptions.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        log.error("Illegal state: {}", ex.getMessage());
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
    }

    /**
     * Handle all other unhandled exceptions.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
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
