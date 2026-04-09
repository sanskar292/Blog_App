package com.yellocode.some.config;

import com.yellocode.some.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Auth — always public
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()

                        // Public read-only endpoints (AntPathRequestMatcher bypasses MvcRequestMatcher quirks)
                        .requestMatchers(new AntPathRequestMatcher("/api/articles",    "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/articles/**", "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/stories",     "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/stories/**",  "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/poetry",      "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/poetry/**",   "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/comments",    "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/comments/**", "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/poetry-comments",    "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/poetry-comments/**", "GET")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/users/*/articles",   "GET")).permitAll()

                        // CORS preflight
                        .requestMatchers(new AntPathRequestMatcher("/**", "OPTIONS")).permitAll()

                        // Everything else requires a valid JWT
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

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