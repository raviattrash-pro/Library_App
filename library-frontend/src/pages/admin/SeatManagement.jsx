import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import seatService from '../../services/seatService';
import { toast } from 'react-toastify';
import './AdminPages.css';

function SeatManagement() {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSeat, setEditingSeat] = useState(null);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        fetchSeats();
    }, []);

    const fetchSeats = async () => {
        try {
            const response = await seatService.getAllSeats();
            setSeats(response.data);
        } catch (error) {
            toast.error('Failed to load seats');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (seatId, newStatus) => {
        try {
            await seatService.updateSeatStatus(seatId, newStatus);
            toast.success('Seat status updated');
            fetchSeats();
        } catch (error) {
            toast.error('Failed to update seat');
        }
    };

    const getRoomSeats = (section) => seats.filter(s => s.section === section);

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    const rooms = ['A', 'B', 'C', 'D', 'E'];

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>🪑 Seat Management</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="admin-stats">
                <div className="stat-box">
                    <span className="stat-value">{seats.length}</span>
                    <span className="stat-label">Total Seats</span>
                </div>
                <div className="stat-box available">
                    <span className="stat-value">{seats.filter(s => s.status === 'AVAILABLE').length}</span>
                    <span className="stat-label">Available</span>
                </div>
                <div className="stat-box booked">
                    <span className="stat-value">{seats.filter(s => s.status === 'BOOKED').length}</span>
                    <span className="stat-label">Booked</span>
                </div>
                <div className="stat-box maintenance">
                    <span className="stat-value">{seats.filter(s => s.status === 'MAINTENANCE').length}</span>
                    <span className="stat-label">Maintenance</span>
                </div>
            </div>

            <div className="rooms-grid">
                {rooms.map(room => (
                    <div key={room} className="room-card">
                        <div className="room-card-header">
                            <h3>Room {room}</h3>
                            <span>{getRoomSeats(room).length} seats</span>
                        </div>
                        <div className="seats-list">
                            {getRoomSeats(room).map(seat => (
                                <div key={seat.id} className={`seat-item ${seat.status.toLowerCase()}`}>
                                    <span className="seat-name">{seat.seatNumber}</span>
                                    <select
                                        value={seat.status}
                                        onChange={(e) => handleStatusChange(seat.id, e.target.value)}
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="BOOKED">Booked</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SeatManagement;
