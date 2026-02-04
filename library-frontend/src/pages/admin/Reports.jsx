import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import bookingService from '../../services/bookingService';
import seatService from '../../services/seatService';
import { toast } from 'react-toastify';
import './AdminPages.css';

function Reports() {
    const [stats, setStats] = useState({
        totalBookings: 0,
        activeBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        trends: []
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

            // 1. Revenue: Only CONFIRMED bookings count towards realized revenue
            const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
            const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

            // 2. Occupancy: Active bookings (Confirmed + Payment Submitted which holds a slot)
            const activeBookings = bookings.filter(b =>
                ['CONFIRMED', 'PAYMENT_SUBMITTED', 'BOOKED'].includes(b.status)
            ).length;

            const totalBookings = bookings.length;
            const occupancyRate = seats.length > 0 ? Math.round((activeBookings / seats.length) * 100) : 0;

            // 3. Trend Chart: Last 7 Days
            const trends = getWeeklyTrends(bookings);

            setStats({
                totalBookings,
                activeBookings,
                totalRevenue,
                occupancyRate,
                trends
            });
        } catch (error) {
            console.error("Error fetching report stats:", error);
            toast.error("Failed to load report data");
            // Fallback mock data for visual stability if API fails completely
            setStats({
                totalBookings: 0,
                activeBookings: 0,
                totalRevenue: 0,
                occupancyRate: 0,
                trends: Array(7).fill({ label: '-', count: 0, percentage: 0 })
            });
        } finally {
            setLoading(false);
        }
    };

    const getWeeklyTrends = (bookings) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const trends = [];
        let maxCount = 0;

        // Generate last 7 days buckets
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const dayLabel = days[date.getDay()];

            // Count bookings for this day (using bookingDate or createdAt if available)
            // Assuming booking.bookingDate is in YYYY-MM-DD format
            const count = bookings.filter(b => b.bookingDate === dateStr).length;
            if (count > maxCount) maxCount = count;

            trends.push({
                label: dayLabel,
                date: dateStr,
                count: count
            });
        }

        // Calculate percentage height for bars relative to max value
        return trends.map(t => ({
            ...t,
            percentage: maxCount > 0 ? (t.count / maxCount) * 100 : 0
        }));
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>📊 Reports & Analytics</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="reports-grid">
                <div className="report-card revenue">
                    <div className="report-icon">💰</div>
                    <div className="report-info">
                        <span className="report-value">₹{stats.totalRevenue.toLocaleString()}</span>
                        <span className="report-label">Total Revenue</span>
                    </div>
                </div>

                <div className="report-card bookings">
                    <div className="report-icon">📅</div>
                    <div className="report-info">
                        <span className="report-value">{stats.totalBookings}</span>
                        <span className="report-label">Total Bookings</span>
                    </div>
                </div>

                <div className="report-card active">
                    <div className="report-icon">✅</div>
                    <div className="report-info">
                        <span className="report-value">{stats.activeBookings}</span>
                        <span className="report-label">Active Bookings</span>
                    </div>
                </div>

                <div className="report-card occupancy">
                    <div className="report-icon">📈</div>
                    <div className="report-info">
                        <span className="report-value">{stats.occupancyRate}%</span>
                        <span className="report-label">Occupancy Rate</span>
                    </div>
                </div>
            </div>

            <div className="chart-placeholder">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>📊 Booking Trends (Last 7 Days)</h3>
                    <div className="dashboard-legend">
                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Based on Booking Date</span>
                    </div>
                </div>

                <div className="chart-visual">
                    {stats.trends.map((day, index) => (
                        <div key={index} className="bar" style={{ height: `${Math.max(day.percentage, 5)}%` }} title={`${day.count} bookings on ${day.date}`}>
                            <span style={{ fontWeight: 'bold' }}>{day.label}</span>
                            {day.count > 0 && <div style={{
                                position: 'absolute',
                                top: '-25px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '0.8rem',
                                opacity: 0.8
                            }}>{day.count}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Reports;
