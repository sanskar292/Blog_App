package com.yellocode.some.controller;

import com.yellocode.some.model.ArticleComment;
import com.yellocode.some.service.ArticleCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private ArticleCommentService commentService;

    @PostMapping("/{articleId}")
    public ArticleComment addComment(@PathVariable Long articleId,
                              @RequestBody ArticleComment comment,
                              Authentication auth) {
        return commentService.addComment(articleId, comment, auth.getName());
    }

    @GetMapping("/{articleId}")
    public List<ArticleComment> getComments(@PathVariable Long articleId) {
        return commentService.getCommentsByArticle(articleId);
    }
}
