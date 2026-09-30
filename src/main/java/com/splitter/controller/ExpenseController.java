package com.splitter.controller;

import com.splitter.dto.ExpenseRequest;
import com.splitter.dto.ExpenseResponse;
import com.splitter.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // POST /api/expenses — add expense to group
    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.addExpense(request));
    }

    // GET /api/groups/{id}/expenses — get all expenses in a group
    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ExpenseResponse>> getGroupExpenses(
            @PathVariable Long groupId) {
        return ResponseEntity.ok(
                expenseService.getGroupExpenses(groupId));
    }
}