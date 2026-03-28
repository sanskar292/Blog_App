package com.yellocode.some.repository;

import com.yellocode.some.model.Poetry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PoetryRepository extends JpaRepository<Poetry, Long> {
    Page<Poetry> findByAuthor(String author, Pageable pageable);
    long countByAuthor(String author);
}
