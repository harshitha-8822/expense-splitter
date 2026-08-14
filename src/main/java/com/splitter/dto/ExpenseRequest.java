package com.splitter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ExpenseRequest {

    @NotBlank(message = "Title cannot be empty")
    private String title;

    @NotNull(message = "Amount cannot be null")
    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    @NotNull(message = "Group id cannot be null")
    private Long groupId;

    private String category;

    // defaults to EQUAL if not provided
    private String splitType = "EQUAL";
}