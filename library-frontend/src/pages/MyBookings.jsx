import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const user = authService.getCurrentUser();
            const response = await bookingService.getUserBookings(user.userId);
            setBookings(response.data);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await bookingService.cancelBooking(id);
                toast.success('Booking cancelled successfully');
                fetchBookings();
            } catch (error) {
                toast.error('Failed to cancel booking');
            }
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="dashboard-container">
            <nav className="navbar glass-card">
                <div className="nav-brand">
                    <h2>Library Management</h2>
                </div>
                <div className="nav-menu">
                    <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="nav-link" onClick={() => navigate('/book-seat')}>Book Seat</button>
                    <button className="nav-link" onClick={() => navigate('/my-bookings')}>My Bookings</button>
                    <button className="btn btn-outline btn-sm" onClick={() => {
                        authService.logout();
                        navigate('/login');
                    }}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="page-header">
                    <h1>My Bookings</h1>
                    <p>View and manage all your seat reservations</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="empty-state glass-card">
                        <span style={{ fontSize: '4rem' }}>📭</span>
                        <h2>No bookings yet</h2>
                        <p>Book your first seat to get started!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/book-seat')}>
                            Book Now
                        </button>
                    </div>
                ) : (
                    <div className="bookings-table-container glass-card">
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Seat Number</th>
                                    <th>Shift</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Duration</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>#{booking.id}</td>
                                        <td><strong>Seat {booking.seatId}</strong></td>
                                        <td>Shift {booking.shiftId}</td>
                                        <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                                        <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                                        <td>{booking.duration}</td>
                                        <td>₹{booking.totalAmount}</td>
                                        <td>
                                            <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.status === 'CONFIRMED' && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleCancel(booking.id)}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyBookings;
