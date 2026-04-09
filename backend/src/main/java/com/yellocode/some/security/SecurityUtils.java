package com.yellocode.some.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Optional;

/**
 * Security utility class for common authentication and authorization operations.
 * 
 * Provides convenient methods to:
 * - Get current authenticated user
 * - Check user roles and permissions
 * - Extract user details from SecurityContext
 */
@Component
public class SecurityUtils {

    /**
     * Get the currently authenticated user's username.
     * Returns empty Optional if no user is authenticated.
     */
    public static Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails userDetails) {
            return Optional.of(userDetails.getUsername());
        }
        
        if (principal instanceof String username) {
            return Optional.of(username);
        }
        
        return Optional.empty();
    }

    /**
     * Get the currently authenticated UserDetails.
     * Returns empty Optional if no user is authenticated.
     */
    public static Optional<UserDetails> getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails userDetails) {
            return Optional.of(userDetails);
        }
        
        return Optional.empty();
    }

    /**
     * Check if the current user has a specific role.
     * Role should be in format "ROLE_USER", "ROLE_ADMIN", etc.
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals(role));
    }

    /**
     * Check if the current user is authenticated.
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null 
                && authentication.isAuthenticated()
                && !(authentication.getPrincipal() instanceof String);
    }

    /**
     * Check if the current user is anonymous/not authenticated.
     */
    public static boolean isAnonymous() {
        return !isAuthenticated();
    }

    /**
     * Get all authorities for the current user.
     */
    public static Collection<? extends GrantedAuthority> getCurrentUserAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return java.util.Collections.emptyList();
        }

        return authentication.getAuthorities();
    }

    /**
     * Check if the current user matches the provided username.
     * Useful for ownership validation.
     */
    public static boolean isCurrentUser(String username) {
        return getCurrentUsername()
                .map(currentUsername -> currentUsername.equals(username))
                .orElse(false);
    }

    /**
     * Get the current authentication object.
     * Useful for advanced scenarios.
     */
    public static Optional<Authentication> getCurrentAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return Optional.ofNullable(authentication);
    }
}
