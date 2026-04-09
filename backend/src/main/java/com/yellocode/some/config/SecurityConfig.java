package com.yellocode.some.config;

import com.yellocode.some.security.JwtFilter;
import com.yellocode.some.service.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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
 * Spring Security 6 configuration.
 *
 * Key design decision: public routes are identified via a plain Java lambda
 * RequestMatcher that reads getRequestURI() and getMethod() directly.
 * This bypasses ALL Spring path-matching infrastructure (MvcRequestMatcher,
 * AntPathRequestMatcher, PathPatternParser) and cannot be affected by
 * Spring Security 6.x path-matching changes or servlet-dispatcher quirks.
 *
 * Existing users are unaffected: same BCryptPasswordEncoder, same DB schema.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtFilter jwtFilter, CustomUserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Filter chain
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())

            .authorizeHttpRequests(auth -> auth
                // Lambda RequestMatcher: pure Java string matching.
                // Does NOT use MvcRequestMatcher or AntPathRequestMatcher.
                .requestMatchers(SecurityConfig::isPublicRequest).permitAll()
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public route matcher — plain Java, no Spring path matching
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns true for requests that do NOT require a JWT.
     *
     * Uses getRequestURI() (not getServletPath()) so it works regardless
     * of how the DispatcherServlet is mapped.  Any context-path prefix is
     * stripped before comparison.
     */
    private static boolean isPublicRequest(HttpServletRequest req) {
        String method = req.getMethod();
        if (method == null) return false;

        // Strip context path if present
        String ctx  = req.getContextPath();          // usually ""
        String uri  = req.getRequestURI();           // "/api/articles"
        String path = (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx))
                      ? uri.substring(ctx.length())
                      : uri;

        // ── OPTIONS (CORS preflight) ────────────────────────────────────────
        if ("OPTIONS".equals(method)) return true;

        // ── Auth endpoints (POST only) ──────────────────────────────────────
        if ("POST".equals(method)) {
            return path.equals("/api/auth/login")
                || path.equals("/api/auth/register");
        }

        // ── Public read-only (GET only) ─────────────────────────────────────
        if ("GET".equals(method)) {
            // Health check — used to verify deployment
            if (path.equals("/api/health")) return true;

            // Articles
            if (path.equals("/api/articles"))            return true;
            if (path.startsWith("/api/articles/"))       return true;

            // Stories
            if (path.equals("/api/stories"))             return true;
            if (path.startsWith("/api/stories/"))        return true;

            // Poetry
            if (path.equals("/api/poetry"))              return true;
            if (path.startsWith("/api/poetry/"))         return true;

            // Comments
            if (path.equals("/api/comments"))            return true;
            if (path.startsWith("/api/comments/"))       return true;

            // Poetry comments
            if (path.equals("/api/poetry-comments"))     return true;
            if (path.startsWith("/api/poetry-comments/")) return true;

            // User article listings  e.g. /api/users/bob/articles
            if (path.matches("/api/users/[^/]+/articles")) return true;
        }

        return false;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Auth / password beans
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg)
            throws Exception {
        return cfg.getAuthenticationManager();
    }

    /**
     * BCryptPasswordEncoder — identical to the original.
     * Existing BCrypt hashes in the database are fully compatible.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CORS
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // setAllowedOriginPatterns + allowCredentials(true) is the correct way
        // to support wildcards — setAllowedOrigins("*") is banned with credentials.
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:*",
                "https://blog-app-jet-iota.vercel.app",
                "https://*.vercel.app"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}