package com.yellocode.some.repository;

import com.yellocode.some.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByAuthor(String author, Pageable pageable);
    long countByAuthor(String author);
}