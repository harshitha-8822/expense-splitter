package com.splitter.strategy;

import com.splitter.model.Expense;
import com.splitter.model.ExpenseSplit;
import com.splitter.model.User;

import java.util.List;

public interface SplitStrategy {

    List<ExpenseSplit> split(Expense expense, List<User> members);
}