package com.yellocode.some.service;

import com.yellocode.some.model.Comment;
import com.yellocode.some.model.Post;
import com.yellocode.some.repository.CommentRepository;
import com.yellocode.some.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    public Comment addComment(Long postId, Comment comment, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        comment.setPost(post);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setAuthor(username); // ← from JWT, no longer anonymous

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPost(Long postId) {
        return commentRepository.findByPostId(postId);
    }
}