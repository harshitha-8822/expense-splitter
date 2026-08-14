package com.splitter.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title cannot be empty")
    private String title;

    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    // Future-ready columns — null for now, used in Week 2
    private String category;

    @Enumerated(EnumType.STRING)
    private SplitType splitType = SplitType.EQUAL;

    private String receiptUrl;

    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "paid_by_id", nullable = false)
    private User paidBy;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @OneToMany(mappedBy = "expense", cascade = CascadeType.ALL)
    private List<ExpenseSplit> splits;

    public enum SplitType {
        EQUAL, PERCENTAGE, EXACT, SHARES
    }
}