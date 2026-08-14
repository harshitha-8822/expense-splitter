package com.splitter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class BalanceResponse {

    private List<Transaction> transactions;
    private List<UserBalance> userBalances;

    @Data
    @AllArgsConstructor
    public static class Transaction {
        private String fromUser;    // who owes
        private String toUser;      // who is owed
        private Double amount;      // how much
    }

    @Data
    @AllArgsConstructor
    public static class UserBalance {
        private String userName;
        private String userEmail;
        private Double netBalance;  // positive = owed, negative = owes
    }
}