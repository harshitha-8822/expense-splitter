package com.splitter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GroupRequest {

    @NotBlank(message = "Group name cannot be empty")
    private String name;

    private String description;
}