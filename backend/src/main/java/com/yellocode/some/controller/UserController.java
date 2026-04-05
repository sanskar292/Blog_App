package com.yellocode.some.controller;

import com.yellocode.some.dto.UserProfileDto;
import com.yellocode.some.model.Article;
import com.yellocode.some.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final ArticleRepository articleRepository;

    public UserController(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(Authentication auth) {
        String username = auth.getName();
        Long articlesCount = articleRepository.countByAuthor(username);
        return ResponseEntity.ok(new UserProfileDto(username, articlesCount));
    }

    @GetMapping("/{username}/articles")
    public ResponseEntity<Page<Article>> getUserArticles(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(articleRepository.findByAuthor(username,
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}
