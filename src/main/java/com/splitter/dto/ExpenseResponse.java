package com.splitter.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ExpenseResponse {

    private Long id;
    private String title;
    private Double amount;
    private String category;
    private String splitType;
    private LocalDate date;
    private String paidByName;
    private String paidByEmail;
    private List<SplitResponse> splits;

    @Data
    public static class SplitResponse {
        private Long userId;
        private String userName;
        private Double shareAmount;
        private Boolean isSettled;
    }
}