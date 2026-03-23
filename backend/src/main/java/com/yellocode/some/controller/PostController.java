package com.yellocode.some.controller;

import com.yellocode.some.model.Post;
import com.yellocode.some.service.PostService;
import com.yellocode.some.dto.PostDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<Page<Post>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(postService.getAllPosts(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) {
        return postService.getPostById(id);
    }

    @PostMapping
    public Post createPost(@RequestBody PostDto dto, Authentication auth) {
        Post post = new Post();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setCoverImage(dto.getCoverImage());
        post.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());
        post.setAuthor(auth.getName());
        post.setPublished(true);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        return postService.createPost(post);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id,
                                        @RequestBody PostDto dto,
                                        Authentication auth) {
        Post existing = postService.getPostById(id);

        if (!existing.getAuthor().equals(auth.getName())) {
            return ResponseEntity.status(403).body("Not authorised to edit this post.");
        }

        existing.setTitle(dto.getTitle());
        existing.setContent(dto.getContent());
        existing.setCoverImage(dto.getCoverImage());
        existing.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());
        existing.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(postService.updatePost(id, existing));
    }

        @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication auth) {
        Post existing = postService.getPostById(id);

        if (!existing.getAuthor().equals(auth.getName())) {
            return ResponseEntity.status(403).body("Not authorised to delete this post.");
        }

        postService.deletePost(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}