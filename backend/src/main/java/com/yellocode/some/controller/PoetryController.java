package com.yellocode.some.controller;

import com.yellocode.some.model.Poetry;
import com.yellocode.some.service.PoetryService;
import com.yellocode.some.dto.PoetryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/poetry")
public class PoetryController {

    private final PoetryService poetryService;

    public PoetryController(PoetryService poetryService) {
        this.poetryService = poetryService;
    }

    @GetMapping
    public ResponseEntity<Page<Poetry>> getAllPoems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(poetryService.getAllPoems(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public Poetry getPoem(@PathVariable Long id) {
        return poetryService.getPoemById(id);
    }

    @PostMapping
    public Poetry createPoem(@RequestBody PoetryDto dto, Authentication auth) {
        Poetry poetry = new Poetry();
        poetry.setTitle(dto.getTitle());
        poetry.setContent(dto.getContent());
        poetry.setMood(dto.getMood());
        poetry.setImageUrl(dto.getImageUrl());
        poetry.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());
        poetry.setAuthor(auth.getName());
        poetry.setPublished(true);
        poetry.setCreatedAt(LocalDateTime.now());
        poetry.setUpdatedAt(LocalDateTime.now());
        return poetryService.createPoem(poetry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePoem(@PathVariable Long id,
                                        @RequestBody PoetryDto dto,
                                        Authentication auth) {
        Poetry existing = poetryService.getPoemById(id);

        if (!existing.getAuthor().equals(auth.getName())) {
            return ResponseEntity.status(403).body("Not authorised to edit this poem.");
        }

        existing.setTitle(dto.getTitle());
        existing.setContent(dto.getContent());
        existing.setMood(dto.getMood());
        existing.setImageUrl(dto.getImageUrl());
        existing.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());
        existing.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(poetryService.updatePoem(id, existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePoem(@PathVariable Long id, Authentication auth) {
        Poetry existing = poetryService.getPoemById(id);

        if (!existing.getAuthor().equals(auth.getName())) {
            return ResponseEntity.status(403).body("Not authorised to delete this poem.");
        }

        poetryService.deletePoem(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    @GetMapping("/author/{author}")
    public ResponseEntity<Page<Poetry>> getPoemsByAuthor(
            @PathVariable String author,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(poetryService.getPoemsByAuthor(author, PageRequest.of(page, size)));
    }
}
