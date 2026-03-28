package com.yellocode.some.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PoetryDto {
    private String title;
    private String content;
    private String mood;
    private List<String> tags;
}
