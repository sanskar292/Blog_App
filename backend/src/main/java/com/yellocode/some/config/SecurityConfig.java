package com.yellocode.some.config;

import com.yellocode.some.security.JwtFilter;
import com.yellocode.some.service.CustomUserDetailsService;
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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 6 configuration.
 *
 * Design decisions:
 *  - AntPathRequestMatcher is used explicitly to avoid the MvcRequestMatcher
 *    path-stripping bug present in Spring Security 6.x with Spring MVC.
 *  - DaoAuthenticationProvider is declared as an explicit bean so the
 *    AuthenticationManager uses our CustomUserDetailsService + BCrypt.
 *  - Stateless JWT — no session, no CSRF.
 *  - BCryptPasswordEncoder (same as before) → existing user passwords unchanged.
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

    // ── Security filter chain ─────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())

            .authorizeHttpRequests(auth -> auth

                // ── Public: auth endpoints ────────────────────────────────
                .requestMatchers(
                    new AntPathRequestMatcher("/api/auth/register", "POST"),
                    new AntPathRequestMatcher("/api/auth/login",    "POST")
                ).permitAll()

                // ── Public: read-only content ─────────────────────────────
                // Two matchers per resource: base path + sub-paths
                .requestMatchers(
                    new AntPathRequestMatcher("/api/articles",    "GET"),
                    new AntPathRequestMatcher("/api/articles/**", "GET"),
                    new AntPathRequestMatcher("/api/stories",     "GET"),
                    new AntPathRequestMatcher("/api/stories/**",  "GET"),
                    new AntPathRequestMatcher("/api/poetry",      "GET"),
                    new AntPathRequestMatcher("/api/poetry/**",   "GET"),
                    new AntPathRequestMatcher("/api/comments",    "GET"),
                    new AntPathRequestMatcher("/api/comments/**", "GET"),
                    new AntPathRequestMatcher("/api/poetry-comments",    "GET"),
                    new AntPathRequestMatcher("/api/poetry-comments/**", "GET"),
                    new AntPathRequestMatcher("/api/users/*/articles",   "GET")
                ).permitAll()

                // ── Public: CORS preflight ────────────────────────────────
                .requestMatchers(new AntPathRequestMatcher("/**", "OPTIONS")).permitAll()

                // ── Everything else requires a valid JWT ──────────────────
                .anyRequest().authenticated()
            )

            // JWT filter runs before Spring's own UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ── Authentication ────────────────────────────────────────────────────────

    /**
     * Explicit DaoAuthenticationProvider so Spring knows exactly which
     * UserDetailsService and PasswordEncoder to use, with no ambiguity.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCryptPasswordEncoder — same as before, so ALL existing user
     * passwords in the database continue to work without migration.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ── CORS ──────────────────────────────────────────────────────────────────

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // setAllowedOriginPatterns + allowCredentials(true) is the correct combo
        // for wildcard origins (setAllowedOrigins("*") is banned when credentials = true)
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:*",
                "https://blog-app-jet-iota.vercel.app",
                "https://*.vercel.app"          // all Vercel preview URLs
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