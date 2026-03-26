package com.yellocode.some.controller;

import com.yellocode.some.dto.UserProfileDto;
import com.yellocode.some.model.Post;
import com.yellocode.some.repository.PostRepository;
import com.yellocode.some.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final PostRepository postRepository;

    public UserController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(Authentication auth) {
        String username = auth.getName();
        Long postsCount = postRepository.countByAuthor(username);
        return ResponseEntity.ok(new UserProfileDto(username, postsCount));
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<Page<Post>> getUserPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(postRepository.findByAuthor(username, 
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}
