package com.yellocode.some.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Injected from env var JWT_SECRET (must be ≥ 32 chars for HS256)
    @Value("${jwt.secret}")
    private String secretString;

    // Token valid for 7 days
    private static final long EXPIRY_MS = 7L * 24 * 60 * 60 * 1000;

    private Key signingKey;

    @PostConstruct
    public void init() {
        // Build the key once at startup — fail fast if secret is absent/too short
        this.signingKey = Keys.hmacShaKeyFor(secretString.getBytes());
    }

    /** Generate a signed JWT for the given username. */
    public String generateToken(String username) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + EXPIRY_MS))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract the username (subject) from a token.
     * Throws JwtException / IllegalArgumentException on any validation failure.
     */
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    /** Returns true only if the token signature is valid and it has not expired. */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ── private ──────────────────────────────────────────────────────────────

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}