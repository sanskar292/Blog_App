package com.yellocode.some.config;

import com.yellocode.some.security.JwtFilter;
import com.yellocode.some.service.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security Configuration - Enterprise Grade Setup
 * 
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ HTTP Request                                                │
 * │   ↓                                                         │
 * │ CORS Filter (pre-flight handling)                           │
 * │   ↓                                                         │
 * │ JWT Filter (token validation & authentication)              │
 * │   ↓                                                         │
 * │ Authorization Rules (permitAll vs authenticated)            │
 * │   ↓                                                         │
 * │ Controller                                                  │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Key Features:
 * - Stateless JWT authentication
 * - BCrypt password encoding (backward compatible)
 * - Role-based authorization
 * - CORS support for frontend
 * - Comprehensive public route definitions
 * 
 * Security Properties:
 * - CSRF disabled (stateless JWT - no sessions to protect)
 * - No session creation (STATELESS policy)
 * - Bearer token authentication only
 * 
 * Backward Compatibility:
 * - Same BCryptPasswordEncoder
 * - Same database schema
 * - Same user authentication flow
 * - Existing tokens remain valid
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtFilter jwtFilter, CustomUserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
        log.info("SecurityConfig initialized with JWT filter and custom user details service");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Security Filter Chain - Main security configuration
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("Configuring SecurityFilterChain with stateless JWT authentication");

        http
            // CORS Configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF - Disabled for stateless JWT (no sessions to protect)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Session Management - Completely stateless
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Authentication Provider
            .authenticationProvider(authenticationProvider())
            
            // Authorization Rules
            .authorizeHttpRequests(auth -> auth
                // Public routes (no authentication required)
                .requestMatchers(SecurityConfig::isPublicRequest).permitAll()
                
                // All other routes require authentication
                .anyRequest().authenticated()
            )
            
            // JWT Filter - Runs before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public Route Matcher - Determines which routes don't need authentication
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Identifies public routes that don't require JWT authentication.
     * 
     * Public Routes:
     * - OPTIONS requests (CORS preflight)
     * - POST /api/auth/login (user login)
     * - POST /api/auth/register (user registration)
     * - GET /api/health (health check)
     * - GET /api/articles/** (article listings and details)
     * - GET /api/stories/** (story listings and details)
     * - GET /api/poetry/** (poetry listings and details)
     * - GET /api/comments/** (comment listings)
     * - GET /api/poetry-comments/** (poetry comment listings)
     * - GET /api/users/{username}/articles (user article listings)
     * 
//   * @param request The HTTP request
     * @return true if the request is public (no auth required)
     */
    private static boolean isPublicRequest(HttpServletRequest req) {
        String method = req.getMethod();
        if (method == null) return false;

        // Strip context path if present
        String ctx  = req.getContextPath();
        String uri  = req.getRequestURI();
        String path = (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx))
                      ? uri.substring(ctx.length())
                      : uri;

        // OPTIONS (CORS preflight) - always public
        if ("OPTIONS".equals(method)) return true;

        // Auth endpoints (POST only)
        if ("POST".equals(method)) {
            return path.equals("/api/auth/login")
                || path.equals("/api/auth/register");
        }

        // Public read-only endpoints (GET only)
        if ("GET".equals(method)) {
            // Health check
            if (path.equals("/api/health")) return true;

            // Articles - listings and details
            if (path.equals("/api/articles") || path.startsWith("/api/articles/")) return true;

            // Stories - listings and details
            if (path.equals("/api/stories") || path.startsWith("/api/stories/")) return true;

            // Poetry - listings and details
            if (path.equals("/api/poetry") || path.startsWith("/api/poetry/")) return true;

            // Comments - listings
            if (path.equals("/api/comments") || path.startsWith("/api/comments/")) return true;

            // Poetry comments - listings
            if (path.equals("/api/poetry-comments") || path.startsWith("/api/poetry-comments/")) return true;

            // User article listings (e.g., /api/users/bob/articles)
            if (path.matches("/api/users/[^/]+/articles")) return true;
        }

        return false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Authentication & Password Encoding Beans
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Authentication Provider - Validates credentials against database.
     * Uses CustomUserDetailsService to load users and BCryptPasswordEncoder
     * to verify passwords.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        
        log.info("Authentication provider configured with BCryptPasswordEncoder");
        return provider;
    }

    /**
     * Authentication Manager - Central authentication orchestrator.
     * Used by AuthController for login validation.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg)
            throws Exception {
        return cfg.getAuthenticationManager();
    }

    /**
     * BCrypt Password Encoder - Industry standard for password hashing.
     * 
     * Compatibility Note:
     * - All existing passwords in the database are BCrypt-encoded
     * - This encoder is fully compatible with those hashes
     * - No password migration needed
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CORS Configuration
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * CORS Configuration - Allows frontend to make cross-origin requests.
     * 
     * Allowed Origins:
     * - http://localhost:5173 (Vite dev server)
     * - http://localhost:* (any localhost port for development)
     * - https://blog-app-jet-iota.vercel.app (production)
     * - https://*.vercel.app (any Vercel deployment)
     * 
     * Security Note:
     * - Uses allowedOriginPatterns (not allowedOrigins) to support wildcards
     * - Credentials enabled for cookie-based auth (if needed in future)
     * - All headers and methods allowed for flexibility
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed origins (patterns support wildcards with credentials)
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:*",
                "https://blog-app-jet-iota.vercel.app",
                "https://*.vercel.app"
        ));

        // Allowed HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // Allow all headers (Authorization header needed for JWT)
        config.setAllowedHeaders(List.of("*"));
        
        // Expose Authorization header for frontend to read JWT
        config.setExposedHeaders(List.of("Authorization"));
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        log.info("CORS configuration initialized with allowed origins: {}", 
                config.getAllowedOriginPatterns());
        
        return source;
    }
}
