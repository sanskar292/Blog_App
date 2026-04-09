package com.yellocode.some.security;

import com.yellocode.some.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter - Executes once per request.
 * 
 * Responsibilities:
 * - Extract Bearer token from Authorization header
 * - Validate token using JwtUtil
 * - Load user details and populate SecurityContext
 * - Log authentication attempts for security auditing
 * 
 * Security Features:
 * - Only processes requests with valid Bearer tokens
 * - Never overwrites existing authentication
 * - Logs failed authentication attempts
 * - Gracefully handles all error scenarios
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = extractJwtFromRequest(request);
            
            if (jwt == null) {
                // No token present - continue unauthenticated
                filterChain.doFilter(request, response);
                return;
            }

            // Skip if already authenticated
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                log.debug("User already authenticated, skipping JWT processing");
                filterChain.doFilter(request, response);
                return;
            }

            // Validate token
            JwtUtil.TokenValidationResult validationResult = jwtUtil.validateToken(jwt);
            
            if (!validationResult.isValid()) {
                log.warn("JWT validation failed for request {}: {} - {}", 
                        request.getRequestURI(), 
                        validationResult.username(),
                        validationResult.errorMessage());
                filterChain.doFilter(request, response);
                return;
            }

            // Load user details and set authentication
            String username = validationResult.username();
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            log.debug("Successfully authenticated user: {} for request: {}", 
                    username, request.getRequestURI());

        } catch (Exception e) {
            // Log unexpected errors but don't interrupt the filter chain
            log.error("Unexpected error in JWT filter: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT from the Authorization header.
     * Returns null if no valid Bearer token is present.
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }
        
        String token = authHeader.substring(BEARER_PREFIX.length());
        
        if (!StringUtils.hasText(token)) {
            log.warn("Empty Bearer token in Authorization header");
            return null;
        }
        
        return token;
    }

    /**
     * This filter should only run once per request.
     * Spring guarantees this by using OncePerRequestFilter.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // No custom skipping needed - process all requests
        return false;
    }
}
