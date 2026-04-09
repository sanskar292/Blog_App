package com.yellocode.some.service;

import com.yellocode.some.model.Story;
import com.yellocode.some.repository.StoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class StoryService {

    private final StoryRepository storyRepository;

    public StoryService(StoryRepository storyRepository) {
        this.storyRepository = storyRepository;
    }

    public Page<Story> getAllStories(Pageable pageable) {
        return storyRepository.findAll(pageable);
    }

    public Story getStoryById(Long id) {
        return storyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Story not found"));
    }

    public Story createStory(Story story) {
        story.setCreatedAt(LocalDateTime.now());
        story.setUpdatedAt(LocalDateTime.now());
        return storyRepository.save(story);
    }

    public void deleteStory(Long id) {
        storyRepository.deleteById(id);
    }
}
