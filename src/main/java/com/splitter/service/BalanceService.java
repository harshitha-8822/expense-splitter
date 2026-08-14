package com.splitter.service;

import com.splitter.dto.BalanceResponse;
import com.splitter.dto.SettlementRequest;
import com.splitter.model.*;
import com.splitter.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BalanceService {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final SettlementRepository settlementRepository;
    private final UserRepository userRepository;

    public BalanceService(GroupRepository groupRepository,
                          ExpenseRepository expenseRepository,
                          ExpenseSplitRepository expenseSplitRepository,
                          SettlementRepository settlementRepository,
                          UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.settlementRepository = settlementRepository;
        this.userRepository = userRepository;
    }

    // ── Get current user ──────────────────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Calculate balances + simplified transactions ───────────────
    public BalanceResponse getGroupBalances(Long groupId) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Get all members
        List<User> members = group.getMembers()
                .stream()
                .map(GroupMember::getUser)
                .collect(Collectors.toList());

        // Step 1: Calculate net balance per person
        Map<Long, Double> netBalances = new HashMap<>();

        // Initialize all members with 0
        for (User member : members) {
            netBalances.put(member.getId(), 0.0);
        }

        // Add what each person paid
        List<Expense> expenses = expenseRepository
                .findByGroupOrderByDateDesc(group);

        for (Expense expense : expenses) {
            Long payerId = expense.getPaidBy().getId();
            netBalances.put(payerId,
                    netBalances.get(payerId) + expense.getAmount());
        }

        // Subtract what each person owes
        for (Expense expense : expenses) {
            List<ExpenseSplit> splits =
                    expenseSplitRepository.findByExpense(expense);
            for (ExpenseSplit split : splits) {
                if (!split.getIsSettled()) {
                    Long userId = split.getUser().getId();
                    netBalances.put(userId,
                            netBalances.get(userId) - split.getShareAmount());
                }
            }
        }

        // Step 2: Build user balance list
        Map<Long, User> memberMap = members.stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<BalanceResponse.UserBalance> userBalances = members.stream()
                .map(member -> new BalanceResponse.UserBalance(
                        member.getName(),
                        member.getEmail(),
                        Math.round(netBalances.get(member.getId())
                                * 100.0) / 100.0))
                .collect(Collectors.toList());

        // Step 3: Debt simplification algorithm
        List<BalanceResponse.Transaction> transactions =
                simplifyDebts(netBalances, memberMap);

        return new BalanceResponse(transactions, userBalances);
    }

    // ── Greedy Debt Simplification Algorithm ──────────────────────
    private List<BalanceResponse.Transaction> simplifyDebts(
            Map<Long, Double> netBalances,
            Map<Long, User> memberMap) {

        List<BalanceResponse.Transaction> transactions = new ArrayList<>();

        // Separate into creditors and debtors
        // Use lists of double arrays: [userId, amount]
        List<double[]> creditors = new ArrayList<>(); // positive balance
        List<double[]> debtors = new ArrayList<>();   // negative balance

        for (Map.Entry<Long, Double> entry : netBalances.entrySet()) {
            double balance = Math.round(entry.getValue() * 100.0) / 100.0;
            if (balance > 0.01) {
                creditors.add(new double[]{entry.getKey(), balance});
            } else if (balance < -0.01) {
                debtors.add(new double[]{entry.getKey(),
                        Math.abs(balance)});
            }
        }

        // Greedy matching
        int i = 0, j = 0;
        while (i < creditors.size() && j < debtors.size()) {

            double[] creditor = creditors.get(i);
            double[] debtor = debtors.get(j);

            // Transaction amount = minimum of the two
            double amount = Math.min(creditor[1], debtor[1]);
            amount = Math.round(amount * 100.0) / 100.0;

            // Create transaction
            User fromUser = memberMap.get((long) debtor[0]);
            User toUser = memberMap.get((long) creditor[0]);

            transactions.add(new BalanceResponse.Transaction(
                    fromUser.getName(),
                    toUser.getName(),
                    amount));

            // Update balances
            creditor[1] -= amount;
            debtor[1] -= amount;

            // Move pointer if settled
            if (creditor[1] < 0.01) i++;
            if (debtor[1] < 0.01) j++;
        }

        return transactions;
    }

    // ── Settle a debt ─────────────────────────────────────────────
    @Transactional
    public void settleDebt(SettlementRequest request) {

        User payer = getCurrentUser();

        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save settlement record
        Settlement settlement = new Settlement();
        settlement.setPayer(payer);
        settlement.setReceiver(receiver);
        settlement.setGroup(group);
        settlement.setAmount(request.getAmount());
        settlement.setDate(LocalDate.now());
        settlementRepository.save(settlement);

        // Mark relevant splits as settled
        List<Expense> expenses = expenseRepository
                .findByGroupOrderByDateDesc(group);

        double remaining = request.getAmount();

        for (Expense expense : expenses) {
            if (remaining <= 0) break;

            List<ExpenseSplit> splits =
                    expenseSplitRepository.findByExpenseAndUser(
                            expense, payer);

            for (ExpenseSplit split : splits) {
                if (!split.getIsSettled() && remaining > 0) {
                    split.setIsSettled(true);
                    remaining -= split.getShareAmount();
                    expenseSplitRepository.save(split);
                }
            }
        }
    }
}