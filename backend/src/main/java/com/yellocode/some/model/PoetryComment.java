package com.yellocode.some.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "poetry_comments")
@AllArgsConstructor
@NoArgsConstructor
public class PoetryComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private String author;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poetry_id")
    @JsonBackReference
    private Poetry poetry;
}
