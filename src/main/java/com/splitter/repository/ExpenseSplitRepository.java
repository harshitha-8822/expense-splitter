package com.splitter.repository;

import com.splitter.model.Expense;
import com.splitter.model.ExpenseSplit;
import com.splitter.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {

    // Get all splits for a specific expense
    List<ExpenseSplit> findByExpense(Expense expense);

    // Get all unsettled splits for a user
    List<ExpenseSplit> findByUserAndIsSettledFalse(User user);

    // Get all unsettled splits for a user in a specific expense
    List<ExpenseSplit> findByExpenseAndUser(Expense expense, User user);
}