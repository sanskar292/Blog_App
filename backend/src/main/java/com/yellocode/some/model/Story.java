package com.yellocode.some.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String author;

    private String genre;

    private int readingTime; // in minutes

    private String coverImage;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ElementCollection
    @CollectionTable(name = "story_tags", joinColumns = @JoinColumn(name = "story_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();
}
