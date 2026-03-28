package com.yellocode.some.controller;

import com.yellocode.some.model.Poetry;
import com.yellocode.some.model.PoetryComment;
import com.yellocode.some.repository.PoetryRepository;
import com.yellocode.some.service.PoetryCommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/poetry-comments")
public class PoetryCommentController {

    private final PoetryCommentService poetryCommentService;
    private final PoetryRepository poetryRepository;

    public PoetryCommentController(PoetryCommentService poetryCommentService,
                                   PoetryRepository poetryRepository) {
        this.poetryCommentService = poetryCommentService;
        this.poetryRepository = poetryRepository;
    }

    @GetMapping("/{poetryId}")
    public List<PoetryComment> getComments(@PathVariable Long poetryId) {
        return poetryCommentService.getCommentsByPoetryId(poetryId);
    }

    @PostMapping("/{poetryId}")
    public PoetryComment createComment(@PathVariable Long poetryId,
                                       @RequestBody String content,
                                       Authentication auth) {
        Poetry poetry = poetryRepository.findById(poetryId)
                .orElseThrow(() -> new RuntimeException("Poetry not found"));

        PoetryComment comment = new PoetryComment();
        comment.setContent(content);
        comment.setAuthor(auth.getName());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setPoetry(poetry);

        return poetryCommentService.createComment(comment);
    }
}
