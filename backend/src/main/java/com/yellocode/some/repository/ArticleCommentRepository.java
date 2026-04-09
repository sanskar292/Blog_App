package com.yellocode.some.repository;

import com.yellocode.some.model.ArticleComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface ArticleCommentRepository extends JpaRepository<ArticleComment, Long> {
    List<ArticleComment> findByArticleId(Long articleId);

}