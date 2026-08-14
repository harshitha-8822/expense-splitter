package com.splitter.repository;

import com.splitter.model.Expense;
import com.splitter.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByGroupOrderByDateDesc(Group group);
}