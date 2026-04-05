package com.yellocode.some.controller;

import com.yellocode.some.model.Story;
import com.yellocode.some.service.StoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping
    public ResponseEntity<Page<Story>> getAllStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(storyService.getAllStories(
                PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Story> getStory(@PathVariable Long id) {
        return ResponseEntity.ok(storyService.getStoryById(id));
    }

    @PostMapping
    public ResponseEntity<Story> createStory(@RequestBody Story story, Authentication auth) {
        story.setAuthor(auth.getName());
        return ResponseEntity.ok(storyService.createStory(story));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable Long id, Authentication auth) {
        Story existing = storyService.getStoryById(id);
        if (!existing.getAuthor().equals(auth.getName())) {
            return ResponseEntity.status(403).body("Not authorised");
        }
        storyService.deleteStory(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}
