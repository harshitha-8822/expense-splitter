
package com.splitter.strategy;

import com.splitter.model.Expense;
import com.splitter.model.ExpenseSplit;
import com.splitter.model.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EqualSplitStrategy implements SplitStrategy {

    @Override
    public List<ExpenseSplit> split(Expense expense, List<User> members) {

        // Calculate equal share
        double shareAmount = expense.getAmount() / members.size();

        // Round to 2 decimal places
        shareAmount = Math.round(shareAmount * 100.0) / 100.0;

        List<ExpenseSplit> splits = new ArrayList<>();

        for (User member : members) {
            ExpenseSplit split = new ExpenseSplit();
            split.setExpense(expense);
            split.setUser(member);
            split.setShareAmount(shareAmount);
            split.setIsSettled(false);
            splits.add(split);
        }

        return splits;
    }
}