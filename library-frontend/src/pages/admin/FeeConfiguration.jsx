import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import shiftService from '../../services/shiftService';
import { toast } from 'react-toastify';
import './AdminPages.css';

function FeeConfiguration() {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingShift, setEditingShift] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            const response = await shiftService.getAllShifts();
            setShifts(response.data);
        } catch (error) {
            toast.error('Failed to load shifts');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (shift) => {
        setEditingShift(shift.id);
        setEditPrice(shift.basePrice);
    };


    const handleSavePrice = async (shiftId) => {
        if (!editPrice || editPrice <= 0) {
            toast.error('Please enter a valid price');
            return;
        }

        try {
            await shiftService.updateShiftPrice(shiftId, parseFloat(editPrice));
            toast.success('Price updated successfully');
            setEditingShift(null);
            fetchShifts();
        } catch (error) {
            console.error('Failed to update price:', error);
            toast.error(error.response?.data?.message || 'Failed to update price');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>💰 Fee Configuration</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="shifts-grid">
                {shifts.map(shift => (
                    <div key={shift.id} className="shift-card">
                        <div className="shift-header">
                            <h3>{shift.name} Shift</h3>
                            <span className="shift-time">{shift.startTime} - {shift.endTime}</span>
                        </div>
                        <p className="shift-description">{shift.description}</p>
                        <div className="shift-price-section">
                            {editingShift === shift.id ? (
                                <form
                                    className="edit-price-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSavePrice(shift.id);
                                    }}
                                >
                                    <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        placeholder="Enter price"
                                        autoFocus
                                    />
                                    <button type="submit" className="btn-save">Save</button>
                                    <button type="button" className="btn-cancel" onClick={() => setEditingShift(null)}>Cancel</button>
                                </form>
                            ) : (
                                <div className="price-display">
                                    <span className="price">₹{shift.basePrice}</span>
                                    <span className="price-label">/month</span>
                                    <button className="btn-edit" onClick={() => handleEditClick(shift)}>Edit</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeeConfiguration;
