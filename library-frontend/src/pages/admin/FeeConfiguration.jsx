import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import shiftService from '../../services/shiftService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSun, FaCloudSun, FaMoon, FaClock, FaEdit, FaSave, FaTimes, FaRupeeSign } from 'react-icons/fa';
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

    const getShiftIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('morning')) return <FaSun color="#f59e0b" size={30} />;
        if (lowerName.includes('afternoon')) return <FaCloudSun color="#f97316" size={30} />;
        if (lowerName.includes('evening')) return <FaMoon color="#8b5cf6" size={30} />;
        return <FaClock color="#ec4899" size={30} />;
    };

    const getShiftColor = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('morning')) return 'rgba(245, 158, 11, 0.1)';
        if (lowerName.includes('afternoon')) return 'rgba(249, 115, 22, 0.1)';
        if (lowerName.includes('evening')) return 'rgba(139, 92, 246, 0.1)';
        return 'rgba(236, 72, 153, 0.1)';
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="back-btn" onClick={() => navigate('/admin')}>
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 style={{ margin: 0 }}>Fee Configuration</h1>
                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Manage seat pricing and shift schedules
                        </p>
                    </div>
                </div>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {shifts.map(shift => (
                    <div
                        key={shift.id}
                        className="glass-card"
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderTop: `4px solid ${getShiftColor(shift.name).replace('0.1)', '1)')}`
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            background: getShiftColor(shift.name),
                            borderRadius: '50%',
                            filter: 'blur(40px)'
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {getShiftIcon(shift.name)}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{shift.name}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            <FaClock size={12} />
                                            <span>{shift.startTime} - {shift.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p style={{ color: '#cbd5e1', marginBottom: '25px', lineHeight: '1.5', minHeight: '48px' }}>
                                {shift.description}
                            </p>

                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '15px',
                                borderRadius: '12px',
                                border: '1px dashed rgba(255,255,255,0.1)'
                            }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
                                    MONTHLY SUBSCRIPTION
                                </label>

                                {editingShift === shift.id ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSavePrice(shift.id);
                                        }}
                                        style={{ display: 'flex', gap: '10px' }}
                                    >
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <FaRupeeSign style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="number"
                                                className="glass-input"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                placeholder="Price"
                                                autoFocus
                                                style={{ paddingLeft: '30px' }}
                                            />
                                        </div>
                                        <button type="submit" className="btn-sm" style={{ background: '#4ade80', color: '#064e3b' }}>
                                            <FaSave />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-sm"
                                            onClick={() => setEditingShift(null)}
                                            style={{ background: '#ef4444', color: 'white' }}
                                        >
                                            <FaTimes />
                                        </button>
                                    </form>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>
                                            ₹{shift.basePrice}
                                        </span>
                                        <button
                                            className="btn-secondary btn-sm"
                                            onClick={() => handleEditClick(shift)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeeConfiguration;
