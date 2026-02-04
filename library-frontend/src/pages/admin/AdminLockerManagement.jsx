import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import lockerService from '../../services/lockerService';
import { toast } from 'react-toastify';
import './AdminPages.css';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function AdminLockerManagement() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScreenshot, setSelectedScreenshot] = useState(null);
    const [userDetails, setUserDetails] = useState({}); // Map of userId -> userData
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await lockerService.getAllBookings(); // Now fetches all (admin endpoint assumed)
            const allBookings = res.data || [];

            // Sort by ID desc
            const sorted = allBookings.sort((a, b) => b.id - a.id);
            setBookings(sorted);

            // Collect unique user IDs
            const userIds = [...new Set(sorted.map(b => b.userId))];
            fetchUserDetails(userIds);

        } catch (error) {
            console.error("Failed to fetch bookings", error);
            toast.error("Failed to load booking requests");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userIds) => {
        const details = {};
        await Promise.all(userIds.map(async (uid) => {
            try {
                // Fetch user directly from auth/user service
                // Must use /api/v1/users prefix
                const res = await api.get(`/api/v1/users/${uid}`);
                details[uid] = res.data;
            } catch (e) {
                console.warn(`Could not fetch details for user ${uid}`);
                details[uid] = { username: `User ${uid}`, email: 'N/A', phoneNumber: 'N/A' };
            }
        }));
        setUserDetails(details);
    };

    const handleVerify = async (id, isApproved) => {
        try {
            await lockerService.verifyBooking(id, isApproved);
            toast.success(isApproved ? "Booking Approved!" : "Booking Rejected");
            fetchBookings();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this approved booking? The locker will be released.")) return;
        try {
            await lockerService.cancelBooking(id);
            toast.success("Booking Cancelled");
            fetchBookings(); // Refresh list 
        } catch (error) {
            toast.error("Cancel failed");
        }
    };

    const renderStatusBadge = (status) => {
        const colors = {
            'PENDING': 'orange',
            'ACTIVE': '#4ade80',
            'CANCELLED': '#f87171',
            'EXPIRED': '#94a3b8'
        };
        return <span style={{
            backgroundColor: colors[status] || '#ccc',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 'bold'
        }}>{status}</span>;
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>🔐 Locker Management</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="glass-card">
                <h3>All Locker Bookings</h3>
                {loading ? <div className="spinner"></div> : (
                    bookings.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>No bookings found.</p> : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User Details</th>
                                        <th>Locker</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Proof</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => {
                                        const user = userDetails[booking.userId] || { username: 'Loading...' };
                                        return (
                                            <tr key={booking.id}>
                                                <td>#{booking.id}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <strong>{user.username || `User ${booking.userId}`}</strong>
                                                        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>📞 {user.phoneNumber || 'N/A'}</span>
                                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>📧 {user.email || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td>{booking.locker?.lockerNumber}</td>
                                                <td>
                                                    {new Date(booking.endDate).getMonth() - new Date(booking.startDate).getMonth() + (12 * (new Date(booking.endDate).getFullYear() - new Date(booking.startDate).getFullYear()))} Mo
                                                    <div style={{ fontSize: '0.8rem' }}>₹{booking.amount}</div>
                                                </td>
                                                <td>{renderStatusBadge(booking.status)}</td>
                                                <td>
                                                    {booking.paymentScreenshot ? (
                                                        <button
                                                            className="btn-sm btn-outline"
                                                            style={{ border: '1px solid var(--primary-color)' }}
                                                            onClick={() => setSelectedScreenshot(`data:image/jpeg;base64,${booking.paymentScreenshot}`)}
                                                        >
                                                            View
                                                        </button>
                                                    ) : <span className="text-muted">-</span>}
                                                </td>
                                                <td className="actions-cell">
                                                    {booking.status === 'PENDING' && (
                                                        <>
                                                            <button className="btn-success btn-sm" onClick={() => handleVerify(booking.id, true)}>Approve</button>
                                                            <button className="btn-danger btn-sm" onClick={() => handleVerify(booking.id, false)}>Reject</button>
                                                        </>
                                                    )}
                                                    {booking.status === 'ACTIVE' && (
                                                        <button className="btn-danger btn-sm" onClick={() => handleCancel(booking.id)}>Cancel Booking</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            {selectedScreenshot && (
                <div className="modal-overlay" onClick={() => setSelectedScreenshot(null)}>
                    <div className="modal-content glass-card" style={{ maxWidth: '500px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <h3>Payment Proof</h3>
                        <img src={selectedScreenshot} alt="Payment" style={{ width: '100%', borderRadius: '8px', marginTop: '1rem', maxHeight: '80vh', objectFit: 'contain' }} />
                        <button className="btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setSelectedScreenshot(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
