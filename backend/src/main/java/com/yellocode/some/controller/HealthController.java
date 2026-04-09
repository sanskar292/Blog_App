package com.yellocode.some.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Lightweight health probe — no auth required.
 * Hit GET /api/health to confirm the latest build is deployed on Render.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final String VERSION = "3.0-lambda-matcher";

    @GetMapping
    public Map<String, String> health() {
        return Map.of(
                "status",  "ok",
                "version", VERSION,
                "time",    Instant.now().toString()
        );
    }
}
