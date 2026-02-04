import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/authService';
import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';
import './Dashboard.css';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            fetchUserBookings(currentUser.userId);
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const fetchUserBookings = async (userId) => {
        try {
            const response = await bookingService.getUserBookings(userId);
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings');
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="navbar glass-card">
                <div className="nav-brand">
                    <h2>Library Management</h2>
                </div>
                <div className="nav-menu">
                    <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    {deferredPrompt && (
                        <button className="nav-link install-btn" onClick={handleInstallClick}>
                            ⬇️ Download App
                        </button>
                    )}
                    <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="nav-link" onClick={() => navigate('/book-seat')}>Book Seat</button>
                    <button className="nav-link" onClick={() => navigate('/lockers')}>Lockers</button>
                    <button className="nav-link" onClick={() => navigate('/my-bookings')}>My Bookings</button>
                    {user?.role === 'ADMIN' && (
                        <button className="nav-link" onClick={() => navigate('/admin')}>Admin</button>
                    )}
                    <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-section glass-card">
                    <h1>Welcome, {user?.firstName}! 👋</h1>
                    <p>Ready to book your perfect study spot?</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card glass-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-info">
                            <h3>{bookings.length}</h3>
                            <p>Total Bookings</p>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{bookings.filter(b => b.status === 'CONFIRMED').length}</h3>
                            <p>Active Bookings</p>
                        </div>
                    </div>

                    <div className="stat-card glass-card">
                        <div className="stat-icon">🪑</div>
                        <div className="stat-info">
                            <h3>{user?.role || 'User'}</h3>
                            <p>Account Type</p>
                        </div>
                    </div>
                </div>

                <div className="quick-actions">
                    <button className="action-card glass-card" onClick={() => navigate('/book-seat')}>
                        <span className="action-icon">🎯</span>
                        <h3>Book a Seat</h3>
                        <p>Find and reserve your ideal study spot</p>
                    </button>

                    <button className="action-card glass-card" onClick={() => navigate('/my-bookings')}>
                        <span className="action-icon">📋</span>
                        <h3>My Bookings</h3>
                        <p>View and manage your reservations</p>
                    </button>

                    <button className="action-card glass-card" onClick={() => navigate('/lockers')}>
                        <span className="action-icon">🔐</span>
                        <h3>Book Locker</h3>
                        <p>Secure specific storage for your books</p>
                    </button>

                    <button className="action-card glass-card" onClick={() => navigate('/order')}>
                        <span className="action-icon">☕</span>
                        <h3>Order Snacks</h3>
                        <p>Order food or stationery to your seat</p>
                    </button>

                    <button className="action-card glass-card" onClick={() => navigate('/maintenance')}>
                        <span className="action-icon">🛠️</span>
                        <h3>Report Issue</h3>
                        <p>Report maintenance issues or feedback</p>
                    </button>

                    <button className="action-card glass-card" onClick={() => navigate('/lost-found')}>
                        <span className="action-icon">🔍</span>
                        <h3>Lost & Found</h3>
                        <p>Check for lost items</p>
                    </button>

                    <button className="action-card glass-card" onClick={() => navigate('/print')}>
                        <span className="action-icon">🖨️</span>
                        <h3>Print Service</h3>
                        <p>Upload documents for printing</p>
                    </button>

                    <button className="action-card glass-card" onClick={() => navigate('/attendance-scan')}>
                        <span className="action-icon">📷</span>
                        <h3>Desk Check-in</h3>
                        <p>Scan QR to mark attendance</p>
                    </button>

                    {user?.role === 'ADMIN' && (
                        <button className="action-card glass-card" onClick={() => navigate('/admin')}>
                            <span className="action-icon">⚙️</span>
                            <h3>Admin Panel</h3>
                            <p>Manage seats, fees, and users</p>
                        </button>
                    )}
                </div>

                {bookings.length > 0 && (
                    <div className="recent-bookings glass-card">
                        <h2>Recent Bookings</h2>
                        <div className="bookings-list">
                            {bookings.slice(0, 5).map((booking) => (
                                <div key={booking.id} className="booking-item">
                                    <div className="booking-details">
                                        <strong>Seat {booking.seatId}</strong>
                                        <span className="booking-date">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
