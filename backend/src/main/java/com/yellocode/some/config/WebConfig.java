package com.yellocode.some.config;

import org.springframework.context.annotation.Configuration;

/**
 * WebConfig is intentionally left without CORS mappings.
 * CORS is fully managed by SecurityConfig via CorsConfigurationSource,
 * which ensures it is applied at the Spring Security filter level
 * (before requests reach Spring MVC).
 *
 * DO NOT add addCorsMappings() here — it would conflict with SecurityConfig's CORS bean.
 */
@Configuration
public class WebConfig {
}