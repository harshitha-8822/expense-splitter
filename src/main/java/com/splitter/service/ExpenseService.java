package com.splitter.service;

import com.splitter.dto.ExpenseRequest;
import com.splitter.dto.ExpenseResponse;
import com.splitter.model.*;
import com.splitter.repository.*;
import com.splitter.strategy.EqualSplitStrategy;
import com.splitter.strategy.SplitStrategy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final EqualSplitStrategy equalSplitStrategy;

    public ExpenseService(ExpenseRepository expenseRepository,
                          ExpenseSplitRepository expenseSplitRepository,
                          GroupRepository groupRepository,
                          GroupMemberRepository groupMemberRepository,
                          UserRepository userRepository,
                          EqualSplitStrategy equalSplitStrategy) {
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.equalSplitStrategy = equalSplitStrategy;
    }

    // ── Get currently logged in user ──────────────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Add expense + auto split ──────────────────────────────────
    @Transactional
    public ExpenseResponse addExpense(ExpenseRequest request) {

        User currentUser = getCurrentUser();

        // Find group
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // Build expense
        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setSplitType(Expense.SplitType.valueOf(
                request.getSplitType()));
        expense.setDate(LocalDate.now());
        expense.setPaidBy(currentUser);
        expense.setGroup(group);

        // Save expense first — needed before creating splits
        expenseRepository.save(expense);

        // Get all group members
        List<User> members = group.getMembers()
                .stream()
                .map(GroupMember::getUser)
                .collect(Collectors.toList());

        // Pick split strategy based on splitType
        SplitStrategy strategy = equalSplitStrategy;

        // Create splits
        List<ExpenseSplit> splits = strategy.split(expense, members);
        expenseSplitRepository.saveAll(splits);

        return mapToResponse(expense, splits);
    }

    // ── Get all expenses for a group ──────────────────────────────
    public List<ExpenseResponse> getGroupExpenses(Long groupId) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        List<Expense> expenses = expenseRepository
                .findByGroupOrderByDateDesc(group);

        return expenses.stream()
                .map(expense -> {
                    List<ExpenseSplit> splits =
                            expenseSplitRepository.findByExpense(expense);
                    return mapToResponse(expense, splits);
                })
                .collect(Collectors.toList());
    }

    // ── Convert Expense + splits to ExpenseResponse ───────────────
    private ExpenseResponse mapToResponse(Expense expense,
                                          List<ExpenseSplit> splits) {

        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setTitle(expense.getTitle());
        response.setAmount(expense.getAmount());
        response.setCategory(expense.getCategory());
        response.setSplitType(expense.getSplitType().name());
        response.setDate(expense.getDate());
        response.setPaidByName(expense.getPaidBy().getName());
        response.setPaidByEmail(expense.getPaidBy().getEmail());

        List<ExpenseResponse.SplitResponse> splitResponses = splits
                .stream()
                .map(split -> {
                    ExpenseResponse.SplitResponse sr =
                            new ExpenseResponse.SplitResponse();
                    sr.setUserId(split.getUser().getId());
                    sr.setUserName(split.getUser().getName());
                    sr.setShareAmount(split.getShareAmount());
                    sr.setIsSettled(split.getIsSettled());
                    return sr;
                })
                .collect(Collectors.toList());

        response.setSplits(splitResponses);
        return response;
    }
}