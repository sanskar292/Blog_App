package com.yellocode.some.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Poetry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String author;

    private boolean published;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String mood;

    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "poetry_tags", joinColumns = @JoinColumn(name = "poetry_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @OneToMany(mappedBy = "poetry", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PoetryComment> comments = new ArrayList<>();
}
