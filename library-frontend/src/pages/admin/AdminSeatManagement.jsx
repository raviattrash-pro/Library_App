import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import seatService from '../../services/seatService';
import bookingService from '../../services/bookingService';
import userService from '../../services/userService';
import shiftService from '../../services/shiftService';
import { toast } from 'react-toastify';
import './AdminPages.css';

function AdminSeatManagement() {
    const [seats, setSeats] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter States
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedShiftId, setSelectedShiftId] = useState('');

    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchLiveData, 10000); // Poll live data every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async () => {
        try {
            const [seatsRes, bookingsRes, usersRes, shiftsRes] = await Promise.all([
                seatService.getAllSeats(),
                bookingService.getAllBookings(),
                userService.getAllUsers(),
                shiftService.getAllShifts()
            ]);

            setSeats(seatsRes.data);
            setBookings(bookingsRes.data);
            setUsers(usersRes.data);
            setShifts(shiftsRes.data);

            // Default to first shift if available and none selected
            if (shiftsRes.data.length > 0 && !selectedShiftId) {
                setSelectedShiftId(shiftsRes.data[0].id);
            }

            if (loading) setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (loading) {
                toast.error('Failed to load dashboard data');
                setLoading(false);
            }
        }
    };

    const fetchLiveData = async () => {
        try {
            // Only fetch volatile data (bookings) frequently
            const bookingsRes = await bookingService.getAllBookings();
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error("Error polling bookings:", error);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAllData().finally(() => {
            setTimeout(() => setRefreshing(false), 500);
        });
    };

    const getSeatStatusForFilter = (seat) => {
        // 1. Check Physical Maintenance first
        if (seat.status === 'MAINTENANCE') return { status: 'MAINTENANCE', details: null };

        // 2. Check Booking for selected Date & Shift
        if (!selectedShiftId) return { status: 'AVAILABLE', details: null };

        const activeBooking = bookings.find(b =>
            b.seatId === seat.id &&
            b.bookingDate === selectedDate &&
            b.shiftId === parseInt(selectedShiftId) &&
            (b.status === 'CONFIRMED' || b.status === 'PAYMENT_SUBMITTED' || b.status === 'PENDING' || b.status === 'BOOKED')
        );

        if (activeBooking) {
            const user = users.find(u => u.id === activeBooking.userId);
            const shift = shifts.find(s => s.id === activeBooking.shiftId);
            return {
                status: 'BOOKED',
                details: {
                    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                    shiftName: shift ? shift.name : 'Unknown Shift',
                    bookingId: activeBooking.id
                }
            };
        }

        return { status: 'AVAILABLE', details: null };
    };

    const handleSeatClick = async (seat, currentStatusData) => {
        // Allow admin to toggle maintenance or view booking details
        if (currentStatusData.status === 'BOOKED') {
            if (window.confirm(`Seat ${seat.seatNumber} is booked by ${currentStatusData.details.userName}. Cancel booking?`)) {
                try {
                    await bookingService.cancelBooking(currentStatusData.details.bookingId);
                    toast.success('Booking cancelled');
                    fetchLiveData();
                } catch (e) {
                    toast.error('Failed to cancel booking');
                }
            }
        } else if (currentStatusData.status === 'AVAILABLE') {
            // Maybe allow marking as maintenance?
            if (window.confirm(`Mark seat ${seat.seatNumber} as Maintenance?`)) {
                try {
                    await seatService.updateSeatStatus(seat.id, 'MAINTENANCE');
                    toast.success('Seat marked as Maintenance');
                    fetchAllData(); // Need to refetch seats for this
                } catch (e) {
                    toast.error('Failed to update seat');
                }
            }
        } else if (currentStatusData.status === 'MAINTENANCE') {
            if (window.confirm(`Set seat ${seat.seatNumber} to Available?`)) {
                try {
                    await seatService.updateSeatStatus(seat.id, 'AVAILABLE');
                    toast.success('Seat marked as Available');
                    fetchAllData();
                } catch (e) {
                    toast.error('Failed to update seat');
                }
            }
        }
    };

    const getRoomSeats = (section) => seats.filter(s => s.section === section);

    // Sort logic
    const sortSeats = (seats) => {
        return seats.sort((a, b) => {
            const numA = parseInt(a.seatNumber.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.seatNumber.replace(/\D/g, '')) || 0;
            return numA - numB;
        });
    };

    const rooms = ['A', 'B', 'C', 'D', 'E'];

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                    <h1>🪑 Live Seat Dashboard</h1>
                </div>

                {/* Filters */}
                <div className="dashboard-filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.7rem', color: '#ccc' }}>Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ background: 'transparent', border: '1px solid #555', color: 'gray', padding: '5px', borderRadius: '4px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '0.7rem', color: '#ccc' }}>Shift</label>
                        <select
                            value={selectedShiftId}
                            onChange={(e) => setSelectedShiftId(e.target.value)}
                            style={{ background: 'transparent', border: '1px solid #555', color: 'gray', padding: '5px', borderRadius: '4px', minWidth: '150px' }}
                        >
                            <option value="">Select Shift</option>
                            {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className={`btn-secondary ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh}>
                        {refreshing ? '↻' : 'Refresh'}
                    </button>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>

            <div className="dashboard-legend">
                <div className="legend-item"><div className="dot green"></div> Available</div>
                <div className="legend-item"><div className="dot red"></div> Booked (Hover for details)</div>
                <div className="legend-item"><div className="dot orange"></div> Maintenance</div>
            </div>

            <div className="rooms-grid">
                {rooms.map(room => (
                    <div key={room} className="room-card">
                        <div className="room-card-header">
                            <h3>Room {room}</h3>
                            <span className="badge">{getRoomSeats(room).length} seats</span>
                        </div>
                        <div className="seat-grid-container">
                            {sortSeats(getRoomSeats(room)).map(seat => {
                                const { status, details } = getSeatStatusForFilter(seat);
                                return (
                                    <div
                                        key={seat.id}
                                        className="seat-wrapper"
                                        onClick={() => handleSeatClick(seat, { status, details })}
                                        title={status === 'BOOKED'
                                            ? `Booked by: ${details.userName}\nSlot: ${details.shiftName}`
                                            : `Seat ${seat.seatNumber}: ${status}`}
                                    >
                                        <div className={`seat-icon ${status.toLowerCase()}`}>
                                            {seat.seatNumber}
                                        </div>
                                        {status === 'BOOKED' && (
                                            <div style={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                background: '#2d3436',
                                                border: '1px solid red',
                                                borderRadius: '4px',
                                                padding: '2px 4px',
                                                fontSize: '0.6rem',
                                                color: 'white',
                                                zIndex: 10,
                                                whiteSpace: 'nowrap',
                                                maxWidth: '80px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {details.userName.split(' ')[0]}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminSeatManagement;
