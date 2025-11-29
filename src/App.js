import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [editingId, setEditingId] = useState(null);

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
      if (editingId) {
        // Update existing expense
        setExpenses(expenses.map(exp => 
          exp.id === editingId 
            ? { ...exp, description, amount: parseFloat(amount), category }
            : exp
        ));
        setEditingId(null);
      } else {
        // Add new expense
        const newExpense = {
          id: Date.now(),
          description,
          amount: parseFloat(amount),
          category,
          date: new Date().toLocaleDateString()
        };
        setExpenses([...expenses, newExpense]);
      }
      setDescription('');
      setAmount('');
      setCategory('Food');
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const startEdit = (expense) => {
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setEditingId(expense.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setCategory('Food');
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Prepare data for pie chart
  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57'];

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
          <div className="button-group">
            <button type="submit" className="submit-btn">
              {editingId ? '✓ Update Expense' : '+ Add Expense'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="cancel-btn">
                ✕ Cancel
              </button>
            )}
          </div>
        </form>

        {chartData.length > 0 && (
          <div className="chart-section">
            <h3>📊 Spending Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `KSh ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

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
              <div key={expense.id} className={`expense-item ${editingId === expense.id ? 'editing' : ''}`}>
                <div className="expense-info">
                  <strong>{expense.description}</strong>
                  <span className="category-badge">{expense.category}</span>
                  <span className="date">{expense.date}</span>
                </div>
                <div className="expense-amount">
                  <span>KSh {expense.amount.toFixed(2)}</span>
                  <button onClick={() => startEdit(expense)} className="edit-btn" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => deleteExpense(expense.id)} className="delete-btn" title="Delete">
                    🗑️
                  </button>
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