import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import financeService from '../../services/financeService';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './AdminPages.css';
import './ProfitLoss.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function ProfitLossDashboard() {
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // ... rest of state


    const [financeData, setFinanceData] = useState({
        incomes: {
            seat: 0,
            locker: 0,
            print: 0,
            snack: 0
        },
        expenditures: [],
        totalExpenditure: 0
    });

    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'Maintenance',
        expenseDate: new Date().toISOString().split('T')[0]
    });

    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [seatRevRes, financeStatsRes, expensesRes] = await Promise.all([
                financeService.getSeatRevenue(),
                financeService.getStats(),
                financeService.getExpenditures()
            ]);

            const seatRev = seatRevRes.data.totalRevenue || 0;
            const libStats = financeStatsRes.data;
            const expenses = expensesRes.data || [];

            setFinanceData({
                incomes: {
                    seat: seatRev,
                    locker: libStats.revenues.lockerRevenue || 0,
                    print: libStats.revenues.printRevenue || 0,
                    snack: libStats.revenues.snackRevenue || 0
                },
                totalExpenditure: libStats.totalExpenditure || 0,
                expenditures: expenses
            });
        } catch (error) {
            console.error("Error fetching finance data:", error);
            toast.error("Failed to load financial data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await financeService.addExpenditure(newExpense);
            toast.success("Expenditure added");
            setNewExpense({ ...newExpense, description: '', amount: '' });
            setIsAdding(false);
            fetchAllData();
        } catch (error) {
            toast.error("Failed to add expenditure");
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await financeService.deleteExpenditure(id);
            toast.success("Deleted");
            fetchAllData();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    // Calculations
    const totalIncome = Object.values(financeData.incomes).reduce((a, b) => a + b, 0);
    const totalExpense = financeData.totalExpenditure; // Correct from stat, or sum local? stat is safer.
    const netProfit = totalIncome - totalExpense;

    // Charts Config
    const doughnutData = {
        labels: ['Seats', 'Lockers', 'Printing', 'Snacks & Stationary'],
        datasets: [
            {
                data: [
                    financeData.incomes.seat,
                    financeData.incomes.locker,
                    financeData.incomes.print,
                    financeData.incomes.snack
                ],
                backgroundColor: [
                    '#4F46E5', // Indigo
                    '#10B981', // Emerald
                    '#F59E0B', // Amber
                    '#EC4899', // Pink
                ],
                borderWidth: 0,
            },
        ],
    };

    const barData = {
        labels: ['Financial Overview'],
        datasets: [
            {
                label: 'Total Income',
                data: [totalIncome],
                backgroundColor: '#10B981',
            },
            {
                label: 'Total Expenditure',
                data: [totalExpense],
                backgroundColor: '#EF4444',
            },
            {
                label: 'Net Profit',
                data: [netProfit],
                backgroundColor: netProfit >= 0 ? '#3B82F6' : '#EF4444',
            }
        ]
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>💰 Profit & Loss Dashboard</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <h3>Total Income</h3>
                    <p className="stat-value income">₹{totalIncome.toFixed(2)}</p>
                </div>
                <div className="stat-card glass-card">
                    <h3>Total Expenses</h3>
                    <p className="stat-value expense">₹{totalExpense.toFixed(2)}</p>
                </div>
                <div className="stat-card glass-card">
                    <h3>Net Profit / Loss</h3>
                    <p className={`stat-value ${netProfit >= 0 ? 'profit' : 'loss'}`}>
                        {netProfit >= 0 ? '+' : ''}₹{netProfit.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="charts-container glass-card">
                <div className="chart-wrapper">
                    <h3>Income Sources</h3>
                    <div className="chart-box">
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="chart-wrapper">
                    <h3>Overview</h3>
                    <div className="chart-box">
                        <Bar
                            data={barData}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' },
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Expenditure Section */}
            <div className="expenditure-section glass-card">
                <div className="section-header">
                    <h2>📉 Expenditure Management</h2>
                    <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? 'Cancel' : '+ Add Expense'}
                    </button>
                </div>

                {isAdding && (
                    <div className="expense-form-container">
                        <h3>Add New Expense</h3>
                        <form onSubmit={handleAddExpense} className="expense-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. AC Repair"
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                        required
                                        className="glass-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={newExpense.amount}
                                        onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        required
                                        className="glass-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                        className="glass-input"
                                    >
                                        <option>Maintenance</option>
                                        <option>Utilities</option>
                                        <option>Salaries</option>
                                        <option>Supplies</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={newExpense.expenseDate}
                                        onChange={e => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                                        className="glass-input"
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Save Expenditure</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="expense-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financeData.expenditures.map(exp => (
                                <tr key={exp.id}>
                                    <td>{exp.expenseDate}</td>
                                    <td>{exp.description}</td>
                                    <td>{exp.category}</td>
                                    <td className="expense-amount">-₹{exp.amount}</td>
                                    <td>
                                        <button onClick={() => handleDeleteExpense(exp.id)} className="btn-icon">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ProfitLossDashboard;
