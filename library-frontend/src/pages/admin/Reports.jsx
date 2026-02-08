import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import bookingService from '../../services/bookingService';
import seatService from '../../services/seatService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaChartLine, FaMoneyBillWave, FaCalendarCheck, FaPercent } from 'react-icons/fa';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './AdminPages.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

function Reports() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        trends: [],
        monthlyRevenue: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [bookingsRes, seatsRes] = await Promise.all([
                bookingService.getAllBookings(),
                seatService.getAllSeats()
            ]);

            const bookings = bookingsRes.data || [];
            const seats = seatsRes.data || [];

            // 1. Revenue
            const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
            const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

            // 2. Occupancy
            const activeBookings = bookings.filter(b =>
                ['CONFIRMED', 'PAYMENT_SUBMITTED', 'BOOKED'].includes(b.status)
            ).length;

            const totalBookings = bookings.length;
            const occupancyRate = seats.length > 0 ? Math.round((activeBookings / seats.length) * 100) : 0;

            // 3. Trend Chart
            const trends = getWeeklyTrends(bookings);

            // 4. Monthly Revenue (Mock distribution based on trends if no real historical data store)
            // In a real app, this should come from a specialized backend endpoint
            const monthlyRevenue = getMonthlyRevenue(bookings);

            setStats({
                totalBookings,
                activeBookings,
                totalRevenue,
                occupancyRate,
                trends,
                monthlyRevenue
            });
        } catch (error) {
            console.error("Error fetching report stats:", error);
            toast.error("Failed to load report data");
        } finally {
            setLoading(false);
        }
    };

    const getWeeklyTrends = (bookings) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const trends = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = days[date.getDay()];
            const count = bookings.filter(b => (b.bookingDate || '').startsWith(dateStr)).length;
            trends.push({ label: dayLabel, count });
        }
        return trends;
    };

    const getMonthlyRevenue = (bookings) => {
        // Simple aggregation by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const revenueData = Array(12).fill(0);

        bookings.forEach(b => {
            if (b.status === 'CONFIRMED' && b.bookingDate) {
                const month = new Date(b.bookingDate).getMonth();
                revenueData[month] += (Number(b.totalAmount) || 0);
            }
        });

        // Return last 6 months for chart
        // simplified for now, returning all months
        return { labels: months, data: revenueData };
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    // Chart Options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#cbd5e1' }
            },
            title: { display: false }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#cbd5e1' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#cbd5e1' }
            }
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="back-btn" onClick={() => navigate('/admin')}>
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 style={{ margin: 0 }}>Reports & Analytics</h1>
                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Platform performance and revenue insights
                        </p>
                    </div>
                </div>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '15px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                        <FaMoneyBillWave size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Total Revenue</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{stats.totalRevenue.toLocaleString()}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '15px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                        <FaCalendarCheck size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Total Bookings</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalBookings}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '15px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
                        <FaPercent size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Occupancy Rate</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.occupancyRate}%</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                <div className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaChartLine color="#8b5cf6" /> Booking Trends (7 Days)
                    </h3>
                    <Line
                        data={{
                            labels: stats.trends.map(t => t.label),
                            datasets: [{
                                label: 'Bookings',
                                data: stats.trends.map(t => t.count),
                                borderColor: '#8b5cf6',
                                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                                tension: 0.4,
                                fill: true
                            }]
                        }}
                        options={chartOptions}
                    />
                </div>

                <div className="glass-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaMoneyBillWave color="#34d399" /> Monthly Revenue
                    </h3>
                    <Bar
                        data={{
                            labels: stats.monthlyRevenue.labels,
                            datasets: [{
                                label: 'Revenue (₹)',
                                data: stats.monthlyRevenue.data,
                                backgroundColor: '#34d399',
                                borderRadius: 4
                            }]
                        }}
                        options={chartOptions}
                    />
                </div>

                <div className="glass-card" style={{ gridColumn: 'span 1' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Booking Status Distribution</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut
                            data={{
                                labels: ['Active', 'Completed', 'Cancelled'],
                                datasets: [{
                                    data: [
                                        stats.activeBookings,
                                        stats.totalBookings - stats.activeBookings, /* Mock completed */
                                        0 /* Mock cancelled */
                                    ],
                                    backgroundColor: ['#60a5fa', '#34d399', '#f87171'],
                                    borderWidth: 0
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reports;
