# Expense Splitter

A full-stack app to split expenses with friends. Create a group, add expenses, and see who owes whom, with debts reduced to the fewest payments.

## Features

- Register and log in (JWT authentication)
- Create groups and add members by email
- Add expenses, split equally among members
- See each member's balance
- Debt simplification: fewest payments to settle up
- Record settlements

## Tech Stack

- **Backend:** Java 17, Spring Boot, Spring Security, JPA, MySQL
- **Frontend:** React, Vite, Tailwind CSS, Axios

## Project Structure

```
expense-splitter/
├── src/        # Spring Boot backend
└── frontend/   # React frontend
```

## How to Run

**1. Create the database**

```sql
CREATE DATABASE expensesplitter;
```

**2. Start the backend**

Copy `src/main/resources/application.properties.example` to `application.properties` in the same folder, then fill in your MySQL password and a JWT secret (32+ characters).

```bash
./mvnw spring-boot:run
```

Runs on http://localhost:8080

**3. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Opens on http://localhost:5173

## How Debt Simplification Works

Each person's balance = amount paid − amount owed. People who owe money are matched with people who are owed, until everyone is settled.

**Example:** A pays ₹300 and B pays ₹150, both split among A, B and C.
Balances: A = +150, B = 0, C = −150 → **C pays A ₹150** (just one payment).
