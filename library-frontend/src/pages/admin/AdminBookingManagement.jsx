import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import bookingService from '../../services/bookingService';
import userService from '../../services/userService';
import seatService from '../../services/seatService';
import shiftService from '../../services/shiftService';
import { toast } from 'react-toastify';
import './AdminPages.css';

function AdminBookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [seats, setSeats] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScreenshot, setSelectedScreenshot] = useState(null);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [bookingRes, userRes, seatRes, shiftRes] = await Promise.all([
                bookingService.getAllBookings(),
                userService.getAllUsers(),
                seatService.getAllSeats(),
                shiftService.getAllShifts()
            ]);
            setBookings(bookingRes.data || []);
            setUsers(userRes.data || []);
            setSeats(seatRes.data || []);
            setShifts(shiftRes.data || []);
        } catch (error) {
            toast.error('Failed to load data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getUserDetails = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user : { firstName: 'Unknown', lastName: '', email: '-', phone: '-' };
    };

    const getSeatNumber = (seatId) => {
        const seat = seats.find(s => s.id === seatId);
        return seat ? seat.seatNumber : 'N/A';
    };

    const getShiftName = (shiftId) => {
        const shift = shifts.find(s => s.id === shiftId);
        return shift ? `${shift.name} (${shift.startTime}-${shift.endTime})` : 'N/A';
    };

    const fetchBookings = fetchData;

    const handleVerifyPayment = async (id) => {
        if (!window.confirm('Verify this payment and confirm the booking?')) return;

        try {
            await bookingService.verifyPayment(id);
            toast.success('Payment verified! Booking confirmed.');
            fetchBookings();
        } catch (error) {
            console.error('Failed to verify payment:', error);
            toast.error(error.response?.data?.message || 'Failed to verify payment');
        }
    };

    const handleRejectPayment = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await bookingService.rejectPayment(id, reason);
            toast.success('Payment rejected');
            fetchBookings();
        } catch (error) {
            console.error('Failed to reject payment:', error);
            toast.error(error.response?.data?.message || 'Failed to reject payment');
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await bookingService.cancelBooking(id);
                toast.success('Booking cancelled');
                fetchBookings();
            } catch (error) {
                toast.error('Failed to cancel booking');
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PAYMENT_SUBMITTED': { label: 'Payment Submitted', class: 'warning', icon: '⏳' },
            'CONFIRMED': { label: 'Confirmed', class: 'success', icon: '✅' },
            'CANCELLED': { label: 'Cancelled', class: 'error', icon: '❌' },
            'PENDING': { label: 'Pending', class: 'info', icon: '⏰' },
            'REJECTED': { label: 'Rejected', class: 'error', icon: '🚫' },
            'BOOKED': { label: 'Booked', class: 'info', icon: '📅' }
        };
        const config = statusConfig[status] || { label: status, class: '', icon: '' };
        return <span className={`status-badge ${config.class}`}>{config.icon} {config.label}</span>;
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>📅 Booking Management</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="admin-stats">
                <div className="stat-box">
                    <span className="stat-value">{bookings.length}</span>
                    <span className="stat-label">Total Bookings</span>
                </div>
                <div className="stat-box available">
                    <span className="stat-value">{bookings.filter(b => b.status === 'CONFIRMED').length}</span>
                    <span className="stat-label">Confirmed</span>
                </div>
                <div className="stat-box booked">
                    <span className="stat-value">{bookings.filter(b => b.status === 'PAYMENT_SUBMITTED').length}</span>
                    <span className="stat-label">Pending Verification</span>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Details</th>
                            <th>Contact</th>
                            <th>Booking Info</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => {
                            const user = getUserDetails(booking.userId);
                            return (
                                <tr key={booking.id}>
                                    <td>#{booking.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{user.firstName} {user.lastName}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>@{user.username}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>📧 {user.email}</div>
                                        <div style={{ fontSize: '0.85rem' }}>📱 {user.phone || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>🪑 {getSeatNumber(booking.seatId)}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>🕒 {getShiftName(booking.shiftId)}</div>
                                    </td>
                                    <td>{booking.bookingDate}</td>
                                    <td>₹{booking.totalAmount}</td>
                                    <td>{getStatusBadge(booking.status)}</td>
                                    <td>
                                        {booking.paymentScreenshot ? (
                                            <button
                                                className="view-screenshot-btn"
                                                onClick={() => setSelectedScreenshot(booking.paymentScreenshot)}
                                            >
                                                🖼️ View
                                            </button>
                                        ) : (
                                            <span style={{ opacity: 0.5 }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {booking.status === 'PAYMENT_SUBMITTED' && (
                                                <>
                                                    <button
                                                        className="btn-verify"
                                                        onClick={() => handleVerifyPayment(booking.id)}
                                                        title="Verify payment and confirm booking"
                                                    >
                                                        ✓ Verify
                                                    </button>
                                                    <button
                                                        className="btn-reject"
                                                        onClick={() => handleRejectPayment(booking.id)}
                                                        title="Reject payment"
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                </>
                                            )}
                                            {booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
                                                <button
                                                    className="btn-cancel"
                                                    onClick={() => handleCancel(booking.id)}
                                                    title="Cancel booking"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                        No bookings found.
                    </div>
                )}
            </div>

            {selectedScreenshot && (
                <div className="screenshot-modal" onClick={() => setSelectedScreenshot(null)}>
                    <div className="screenshot-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedScreenshot(null)}>✕</button>
                        <h3>Payment Screenshot</h3>
                        <img src={selectedScreenshot} alt="Payment Screenshot" />
                    </div>
                </div>
            )}

            <style>{`
                .status-badge {
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: inline-block;
                }

                .status-badge.success {
                    background: rgba(76, 175, 80, 0.2);
                    color: #4CAF50;
                }

                .status-badge.warning {
                    background: rgba(255, 152, 0, 0.2);
                    color: #FF9800;
                }

                .status-badge.error {
                    background: rgba(244, 67, 54, 0.2);
                    color: #F44336;
                }

                .status-badge.info {
                    background: rgba(33, 150, 243, 0.2);
                    color: #2196F3;
                }

                .view-screenshot-btn {
                    padding: 0.3rem 0.6rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: transform 0.2s;
                }

                .view-screenshot-btn:hover {
                    transform: scale(1.05);
                }

                .btn-verify, .btn-reject, .btn-cancel {
                    padding: 0.3rem 0.6rem;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .btn-verify {
                    background: #4CAF50;
                    color: white;
                }

                .btn-verify:hover {
                    background: #45a049;
                }

                .btn-reject {
                    background: #FF9800;
                    color: white;
                }

                .btn-reject:hover {
                    background: #e68900;
                }

                .btn-cancel {
                    background: #F44336;
                    color: white;
                }

                .btn-cancel:hover {
                    background: #da190b;
                }

                .screenshot-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.3s;
                }

                .screenshot-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 16px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow: auto;
                    position: relative;
                }

                .screenshot-content h3 {
                    margin: 0 0 1rem 0;
                    color: #333;
                }

                .screenshot-content img {
                    max-width: 100%;
                    max-height: 70vh;
                    border-radius: 8px;
                    display: block;
                }

                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: #F44336;
                    color: white;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-btn:hover {
                    background: #da190b;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default AdminBookingManagement;
