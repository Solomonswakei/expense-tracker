import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [editingId, setEditingId] = useState(null);
  const [budget, setBudget] = useState(10000);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedBudget = localStorage.getItem('budget');
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedBudget) setBudget(parseFloat(savedBudget));
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budget', budget.toString());
  }, [budget]);

  const addExpense = (e) => {
    e.preventDefault();
    if (description && amount) {
      if (editingId) {
        setExpenses(expenses.map(exp => 
          exp.id === editingId 
            ? { ...exp, description, amount: parseFloat(amount), category }
            : exp
        ));
        setEditingId(null);
      } else {
        const newExpense = {
          id: Date.now(),
          description,
          amount: parseFloat(amount),
          category,
          date: new Date().toISOString()
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

  const getFilteredExpenses = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      if (dateFilter === 'today') return expDate >= today;
      if (dateFilter === 'week') return expDate >= weekAgo;
      if (dateFilter === 'month') return expDate >= monthStart;
      return true;
    });
  };

  const filteredExpenses = getFilteredExpenses();
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  const budgetPercentage = (totalExpenses / budget) * 100;

  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyData = expenses.reduce((acc, exp) => {
    const date = new Date(exp.date);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    acc[monthYear] = (acc[monthYear] || 0) + exp.amount;
    return acc;
  }, {});

  const trendData = Object.entries(monthlyData).slice(-6).map(([month, amount]) => ({
    month,
    amount
  }));

  const exportToExcel = () => {
    const data = filteredExpenses.map(exp => ({
      Date: new Date(exp.date).toLocaleDateString(),
      Description: exp.description,
      Category: exp.category,
      Amount: exp.amount
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, 'expenses.xlsx');
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57'];

  const getBudgetStatus = () => {
    if (budgetPercentage >= 100) return { text: 'Budget Exceeded!', color: '#ff4757', icon: '🚨' };
    if (budgetPercentage >= 80) return { text: 'Approaching Limit', color: '#ffa502', icon: '⚠️' };
    return { text: 'On Track', color: '#26de81', icon: '✅' };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <h1>💰 Expense Tracker Pro</h1>
          <button onClick={() => setShowBudgetModal(true)} className="budget-btn">
            🎯 Set Budget
          </button>
        </header>

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon">💸</div>
            <div className="stat-info">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">KSh {totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">{budgetStatus.icon}</div>
            <div className="stat-info">
              <span className="stat-label">Budget Status</span>
              <span className="stat-value" style={{ color: budgetStatus.color }}>
                {budgetStatus.text}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-label">Total Expenses</span>
              <span className="stat-value">{filteredExpenses.length}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-label">Monthly Budget</span>
              <span className="stat-value">KSh {budget.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="budget-progress">
          <div className="progress-header">
            <span>Budget Usage: {budgetPercentage.toFixed(1)}%</span>
            <span>KSh {(budget - totalExpenses).toFixed(2)} remaining</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min(budgetPercentage, 100)}%`,
                backgroundColor: budgetStatus.color
              }}
            ></div>
          </div>
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
              {editingId ? '✓ Update' : '+ Add Expense'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="cancel-btn">
                ✕ Cancel
              </button>
            )}
          </div>
        </form>

        <div className="controls">
          <div className="filter-buttons">
            <button 
              className={dateFilter === 'today' ? 'active' : ''} 
              onClick={() => setDateFilter('today')}
            >
              Today
            </button>
            <button 
              className={dateFilter === 'week' ? 'active' : ''} 
              onClick={() => setDateFilter('week')}
            >
              This Week
            </button>
            <button 
              className={dateFilter === 'month' ? 'active' : ''} 
              onClick={() => setDateFilter('month')}
            >
              This Month
            </button>
            <button 
              className={dateFilter === 'all' ? 'active' : ''} 
              onClick={() => setDateFilter('all')}
            >
              All Time
            </button>
          </div>
          <button onClick={exportToExcel} className="export-btn" disabled={filteredExpenses.length === 0}>
            📥 Export to Excel
          </button>
        </div>

        {chartData.length > 0 && (
          <div className="charts-grid">
            <div className="chart-section">
              <h3>📊 Category Breakdown</h3>
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

            {trendData.length > 1 && (
              <div className="chart-section">
                <h3>📈 Monthly Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `KSh ${value.toFixed(2)}`} />
                    <Bar dataKey="amount" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        <div className="expenses-list">
          <h3>Recent Expenses ({filteredExpenses.length}):</h3>
          {filteredExpenses.length === 0 ? (
            <p className="no-expenses">No expenses for this period. Add your first one! 👆</p>
          ) : (
            filteredExpenses.map(expense => (
              <div key={expense.id} className={`expense-item ${editingId === expense.id ? 'editing' : ''}`}>
                <div className="expense-info">
                  <strong>{expense.description}</strong>
                  <span className="category-badge">{expense.category}</span>
                  <span className="date">{new Date(expense.date).toLocaleDateString()}</span>
                </div>
                <div className="expense-amount">
                  <span>KSh {expense.amount.toFixed(2)}</span>
                  <button onClick={() => startEdit(expense)} className="edit-btn">✏️</button>
                  <button onClick={() => deleteExpense(expense.id)} className="delete-btn">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {showBudgetModal && (
          <div className="modal-overlay" onClick={() => setShowBudgetModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Set Monthly Budget</h2>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                placeholder="Enter budget amount"
                step="100"
              />
              <div className="modal-buttons">
                <button onClick={() => setShowBudgetModal(false)} className="modal-save">
                  Save Budget
                </button>
                <button onClick={() => setShowBudgetModal(false)} className="modal-cancel">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;