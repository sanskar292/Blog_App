package com.yellocode.some.service;

import com.yellocode.some.model.ArticleComment;
import com.yellocode.some.model.Article;
import com.yellocode.some.repository.ArticleCommentRepository;
import com.yellocode.some.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ArticleCommentService {

    @Autowired
    private ArticleCommentRepository commentRepository;

    @Autowired
    private ArticleRepository articleRepository;

    public ArticleComment addComment(Long articleId, ArticleComment comment, String username) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        comment.setArticle(article);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setAuthor(username); // from JWT, no longer anonymous

        return commentRepository.save(comment);
    }

    public List<ArticleComment> getCommentsByArticle(Long articleId) {
        return commentRepository.findByArticleId(articleId);
    }
}