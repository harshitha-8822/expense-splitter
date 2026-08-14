package com.splitter.controller;

import com.splitter.dto.BalanceResponse;
import com.splitter.dto.SettlementRequest;
import com.splitter.service.BalanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    // GET /api/groups/{id}/balances
    @GetMapping("/api/groups/{id}/balances")
    public ResponseEntity<BalanceResponse> getGroupBalances(
            @PathVariable Long id) {
        return ResponseEntity.ok(balanceService.getGroupBalances(id));
    }

    // POST /api/settlements
    @PostMapping("/api/settlements")
    public ResponseEntity<String> settleDebt(
            @Valid @RequestBody SettlementRequest request) {
        balanceService.settleDebt(request);
        return ResponseEntity.ok("Settlement recorded successfully");
    }
}