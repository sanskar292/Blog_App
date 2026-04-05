package com.yellocode.some.controller;

import com.yellocode.some.model.Comment;
import com.yellocode.some.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/{articleId}")
    public Comment addComment(@PathVariable Long articleId,
                              @RequestBody Comment comment,
                              Authentication auth) {
        return commentService.addComment(articleId, comment, auth.getName());
    }

    @GetMapping("/{articleId}")
    public List<Comment> getComments(@PathVariable Long articleId) {
        return commentService.getCommentsByArticle(articleId);
    }
}
