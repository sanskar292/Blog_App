package com.yellocode.some.service;

import com.yellocode.some.model.User;
import com.yellocode.some.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Custom UserDetailsService implementation that loads users from the database.
 * 
 * Features:
 * - Loads user by username with proper error handling
 * - Converts User entity to Spring Security UserDetails
 * - Assigns role-based authorities
 * - Logs authentication attempts for auditing
 * 
 * Backward Compatibility:
 * - Works with existing BCrypt-encoded passwords
 * - Maintains same user table structure
 * - Preserves existing user roles
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Load user by username for authentication.
     * 
     * @param username The username to look up
     * @return UserDetails object for Spring Security
     * @throws UsernameNotFoundException if user doesn't exist
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user details for username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("User not found in database: {}", username);
                    return new UsernameNotFoundException("User not found: " + username);
                });

        log.debug("Successfully loaded user: {} with role: {}", username, user.getRole());

        return buildUserDetails(user);
    }

    /**
     * Convert User entity to Spring Security UserDetails.
     */
    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority(user.getRole())))
                .build();
    }

    /**
     * Load user by ID (for programmatic access).
     * Not used by Spring Security directly, but useful for services.
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long userId) {
        log.debug("Loading user details by ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found in database with ID: {}", userId);
                    return new UsernameNotFoundException("User not found with ID: " + userId);
                });

        return buildUserDetails(user);
    }
}
