package com.yellocode.some.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * Enhanced JWT utility class providing token generation, validation, and claim extraction.
 * 
 * Features:
 * - Access token generation (7-day expiry)
 * - Refresh token generation (30-day expiry)
 * - Token validation with detailed error reporting
 * - Claim extraction utilities
 * - Backward compatible with existing tokens
 */
@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secretString;

    // Access token: 7 days
    private static final long ACCESS_TOKEN_EXPIRY_MS = 7L * 24 * 60 * 60 * 1000;
    
    // Refresh token: 30 days
    private static final long REFRESH_TOKEN_EXPIRY_MS = 30L * 24 * 60 * 60 * 1000;

    private Key signingKey;

    @PostConstruct
    public void init() {
        this.signingKey = Keys.hmacShaKeyFor(secretString.getBytes());
        log.info("JWT signing key initialized successfully");
    }

    /**
     * Generate an access token for the given username.
     * Backward compatible with the original implementation.
     */
    public String generateToken(String username) {
        return generateAccessToken(username);
    }

    /**
     * Generate an access token with default expiry (7 days).
     */
    public String generateAccessToken(String username) {
        return buildToken(username, Map.of("type", "access"), ACCESS_TOKEN_EXPIRY_MS);
    }

    /**
     * Generate a refresh token with extended expiry (30 days).
     */
    public String generateRefreshToken(String username) {
        return buildToken(username, Map.of("type", "refresh"), REFRESH_TOKEN_EXPIRY_MS);
    }

    /**
     * Build a JWT with custom claims and expiry.
     */
    private String buildToken(String username, Map<String, Object> extraClaims, long expiryMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(username)
                .addClaims(extraClaims)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expiryMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract username (subject) from token.
     * @throws JwtException if token is invalid
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract expiration date from token.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract token type claim (access or refresh).
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    /**
     * Extract a specific claim from the token.
     * @throws JwtException if token is invalid
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Comprehensive token validation.
     * Returns true only if token is valid and not expired.
     */
    public boolean isTokenValid(String token) {
        try {
            final String username = extractUsername(token);
            return username != null && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if token has expired.
     */
    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    /**
     * Validate token for a specific user.
     */
    public boolean isTokenValidForUser(String token, String username) {
        try {
            final String tokenUsername = extractUsername(token);
            return tokenUsername.equals(username) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Token validation failed for user {}: {}", username, e.getMessage());
            return false;
        }
    }

    /**
     * Get validation result with detailed error message.
     * Useful for logging and debugging.
     */
    public TokenValidationResult validateToken(String token) {
        try {
            getAllClaims(token);
            String username = extractUsername(token);
            boolean expired = isTokenExpired(token);
            String type = extractTokenType(token);
            
            if (expired) {
                return TokenValidationResult.expired(username);
            }
            return TokenValidationResult.valid(username, type);
        } catch (ExpiredJwtException e) {
            return TokenValidationResult.expired(extractUsernameSafely(e.getClaims()));
        } catch (SignatureException e) {
            return TokenValidationResult.invalid("Invalid signature");
        } catch (MalformedJwtException e) {
            return TokenValidationResult.invalid("Malformed token");
        } catch (UnsupportedJwtException e) {
            return TokenValidationResult.invalid("Unsupported token type");
        } catch (IllegalArgumentException e) {
            return TokenValidationResult.invalid("Token is null or empty");
        } catch (Exception e) {
            return TokenValidationResult.invalid("Validation error: " + e.getMessage());
        }
    }

    /**
     * Parse and return all claims from the token.
     * @throws JwtException if token is invalid
     */
    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Safely extract username from claims, handling null cases.
     */
    private String extractUsernameSafely(Claims claims) {
        return claims != null ? claims.getSubject() : null;
    }

    /**
     * Token validation result with detailed information.
     */
    public record TokenValidationResult(
            boolean isValid,
            String username,
            String tokenType,
            String errorMessage
    ) {
        public static TokenValidationResult valid(String username, String tokenType) {
            return new TokenValidationResult(true, username, tokenType, null);
        }

        public static TokenValidationResult expired(String username) {
            return new TokenValidationResult(false, username, null, "Token has expired");
        }

        public static TokenValidationResult invalid(String error) {
            return new TokenValidationResult(false, null, null, error);
        }
    }
}
