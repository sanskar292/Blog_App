package com.yellocode.some.repository;

import com.yellocode.some.model.PoetryComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PoetryCommentRepository extends JpaRepository<PoetryComment, Long> {
    List<PoetryComment> findByPoetryId(Long poetryId);
}
