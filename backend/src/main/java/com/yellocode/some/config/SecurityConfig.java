package com.yellocode.some.config;

import com.yellocode.some.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS must be first — uses our CorsConfigurationSource bean below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Disable CSRF — stateless JWT app doesn't need it
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Stateless session — no HttpSession ever created
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Route-level authorization
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints — always public
                        .requestMatchers("/api/auth/**").permitAll()

                        // Public GET endpoints — list BOTH the base path and /** wildcard
                        // Spring Security 6 PathPatternParser: "/api/articles/**" does NOT
                        // match "/api/articles" (no trailing slash), so both are required.
                        .requestMatchers(HttpMethod.GET, "/api/articles", "/api/articles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/stories", "/api/stories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/poetry", "/api/poetry/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments", "/api/comments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/poetry-comments", "/api/poetry-comments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/*/articles").permitAll()

                        // Preflight OPTIONS — must be open or CORS breaks
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Everything else requires a valid JWT
                        .anyRequest().authenticated()
                )

                // 5. JWT filter runs before username/password filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Single source of truth for CORS.
     * Defined here so Spring Security applies it at the filter level,
     * before requests even reach Spring MVC.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Use AllowedOriginPatterns to support Vercel preview URLs (*.vercel.app)
        // while keeping credentials support enabled
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:*",
                "https://blog-app-jet-iota.vercel.app",
                "https://*.vercel.app"          // covers all Vercel preview deploys
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Allow all headers — including Authorization for JWT
        config.setAllowedHeaders(List.of("*"));

        // Expose Authorization header to frontend if needed
        config.setExposedHeaders(List.of("Authorization"));

        // Required for JWT cookies or Authorization header to be sent cross-origin
        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour — reduces OPTIONS requests
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}