import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  // Load expenses from localStorage when app starts
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (e) => {
    e.preventDefault();
    if (description && amount) {
      const newExpense = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        category,
        date: new Date().toLocaleDateString()
      };
      setExpenses([...expenses, newExpense]);
      setDescription('');
      setAmount('');
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  return (
    <div className="App">
      <div className="container">
        <h1>💰 Expense Tracker</h1>
        
        <div className="summary">
          <h2>Total Spent: KSh {totalExpenses.toFixed(2)}</h2>
        </div>

        <form onSubmit={addExpense} className="expense-form">
          <input
            type="text"
            placeholder="Description (e.g., Lunch)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Amount (KSh)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Food">🍔 Food</option>
            <option value="Transport">🚗 Transport</option>
            <option value="Entertainment">🎮 Entertainment</option>
            <option value="Bills">💡 Bills</option>
            <option value="Shopping">🛍️ Shopping</option>
            <option value="Health">⚕️ Health</option>
            <option value="Other">📦 Other</option>
          </select>
          <button type="submit">Add Expense</button>
        </form>

        {Object.keys(categoryTotals).length > 0 && (
          <div className="category-summary">
            <h3>Spending by Category:</h3>
            <div className="category-grid">
              {Object.entries(categoryTotals).map(([cat, total]) => (
                <div key={cat} className="category-item">
                  <span>{cat}</span>
                  <span>KSh {total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="expenses-list">
          <h3>Recent Expenses:</h3>
          {expenses.length === 0 ? (
            <p className="no-expenses">No expenses yet. Add your first one above! 👆</p>
          ) : (
            expenses.map(expense => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <strong>{expense.description}</strong>
                  <span className="category-badge">{expense.category}</span>
                  <span className="date">{expense.date}</span>
                </div>
                <div className="expense-amount">
                  <span>KSh {expense.amount.toFixed(2)}</span>
                  <button onClick={() => deleteExpense(expense.id)} className="delete-btn">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;