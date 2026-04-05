package com.yellocode.some.service;

import com.yellocode.some.model.Article;
import com.yellocode.some.repository.ArticleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleService(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    // GET ALL
    public Page<Article> getAllArticles(Pageable pageable) {
        return articleRepository.findAll(pageable);
    }

    // GET BY ID
    public Article getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    // CREATE
    public Article createArticle(Article article) {
        return articleRepository.save(article);
    }

    // UPDATE
    public Article updateArticle(Long id, Article updatedArticle) {

        Article existingArticle = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        existingArticle.setTitle(updatedArticle.getTitle());
        existingArticle.setContent(updatedArticle.getContent());
        existingArticle.setAuthor(updatedArticle.getAuthor());
        existingArticle.setPublished(updatedArticle.isPublished());
        existingArticle.setCoverImage(updatedArticle.getCoverImage());
        existingArticle.setTags(updatedArticle.getTags());
        existingArticle.setUpdatedAt(updatedArticle.getUpdatedAt());

        return articleRepository.save(existingArticle);
    }

    // SEARCH
    public Page<Article> searchArticles(String query, Pageable pageable) {
        return articleRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query, pageable);
    }

    // DELETE
    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        articleRepository.delete(article);
    }
}
