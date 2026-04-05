package com.yellocode.some.service;

import com.yellocode.some.model.Comment;
import com.yellocode.some.model.Article;
import com.yellocode.some.repository.CommentRepository;
import com.yellocode.some.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ArticleRepository articleRepository;

    public Comment addComment(Long articleId, Comment comment, String username) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        comment.setArticle(article);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setAuthor(username); // from JWT, no longer anonymous

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByArticle(Long articleId) {
        return commentRepository.findByArticleId(articleId);
    }
}