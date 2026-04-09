package com.yellocode.some.service;

import com.yellocode.some.model.Poetry;
import com.yellocode.some.repository.PoetryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PoetryService {

    private final PoetryRepository poetryRepository;

    public PoetryService(PoetryRepository poetryRepository) {
        this.poetryRepository = poetryRepository;
    }

    // GET ALL
    public Page<Poetry> getAllPoems(Pageable pageable) {
        return poetryRepository.findAll(pageable);
    }

    // GET BY ID
    public Poetry getPoemById(Long id) {
        return poetryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Poetry not found"));
    }

    // CREATE
    public Poetry createPoem(Poetry poetry) {
        return poetryRepository.save(poetry);
    }

    // UPDATE
    public Poetry updatePoem(Long id, Poetry updatedPoem) {
        Poetry existingPoem = poetryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Poetry not found"));

        existingPoem.setTitle(updatedPoem.getTitle());
        existingPoem.setContent(updatedPoem.getContent());
        existingPoem.setMood(updatedPoem.getMood());
        existingPoem.setTags(updatedPoem.getTags());
        existingPoem.setUpdatedAt(updatedPoem.getUpdatedAt());

        return poetryRepository.save(existingPoem);
    }

    // DELETE
    public void deletePoem(Long id) {
        Poetry poetry = poetryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Poetry not found"));

        poetryRepository.delete(poetry);
    }

    // GET BY AUTHOR
    public Page<Poetry> getPoemsByAuthor(String author, Pageable pageable) {
        return poetryRepository.findByAuthor(author, pageable);
    }
}
