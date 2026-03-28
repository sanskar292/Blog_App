package com.yellocode.some.service;

import com.yellocode.some.model.PoetryComment;
import com.yellocode.some.repository.PoetryCommentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PoetryCommentService {

    private final PoetryCommentRepository poetryCommentRepository;

    public PoetryCommentService(PoetryCommentRepository poetryCommentRepository) {
        this.poetryCommentRepository = poetryCommentRepository;
    }

    public List<PoetryComment> getCommentsByPoetryId(Long poetryId) {
        return poetryCommentRepository.findByPoetryId(poetryId);
    }

    public PoetryComment createComment(PoetryComment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        return poetryCommentRepository.save(comment);
    }
}
