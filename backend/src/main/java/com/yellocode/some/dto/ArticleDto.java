package com.yellocode.some.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDto {
    private String title;
    private String content;
    private String coverImage;
    private List<String> tags;
}