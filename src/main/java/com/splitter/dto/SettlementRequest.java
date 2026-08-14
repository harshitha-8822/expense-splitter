package com.splitter.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SettlementRequest {

    @NotNull
    private Long groupId;

    @NotNull
    private Long receiverId;   // who receives the payment

    @NotNull
    @Positive
    private Double amount;
}