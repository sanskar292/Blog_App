package com.yellocode.some.controller;

import com.yellocode.some.model.Article;
import com.yellocode.some.service.ArticleService;
import com.yellocode.some.dto.ArticleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public ResponseEntity<Page<Article>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(articleService.getAllArticles(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Article>> searchArticles(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(articleService.searchArticles(q, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }


    @GetMapping("/{id}")
    public Article getArticle(@PathVariable Long id) {
        return articleService.getArticleById(id);
    }

    @PostMapping
    public Article createArticle(@RequestBody ArticleDto dto, Authentication auth) {
        Article article = new Article();
        article.setTitle(dto.getTitle());
        article.setContent(dto.getContent());
        article.setCoverImage(dto.getCoverImage());
        article.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());
        article.setAuthor(auth.getName());
        article.setPublished(true);
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        return articleService.createArticle(article);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable Long id,
                                        @RequestBody ArticleDto dto,
                                        Authentication auth) {
        Article existing = articleService.getArticleById(id);

        if (!existing.getAuthor().equals(auth.getName())) {
            return ResponseEntity.status(403).body("Not authorised to edit this article.");
        }

        existing.setTitle(dto.getTitle());
        existing.setContent(dto.getContent());
        existing.setCoverImage(dto.getCoverImage());
        existing.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());
        existing.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(articleService.updateArticle(id, existing));
    }

        @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable Long id, Authentication auth) {
        Article existing = articleService.getArticleById(id);

        if (!existing.getAuthor().equals(auth.getName())) {
            return ResponseEntity.status(403).body("Not authorised to delete this article.");
        }

        articleService.deleteArticle(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}