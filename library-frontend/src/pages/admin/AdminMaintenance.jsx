import React, { useState, useEffect } from 'react';
import maintenanceService from '../../services/maintenanceService';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion'; // Added framer-motion
import { FaArrowLeft, FaFilter, FaTools, FaCheckCircle, FaExclamationCircle, FaUser, FaCalendarAlt, FaEnvelope, FaPhone } from 'react-icons/fa'; // Added Icons
import './AdminPages.css';

const AdminMaintenance = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null);
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await maintenanceService.getAllRequests();
            data.sort((a, b) => {
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setRequests(data);
        } catch (error) {
            console.error("Error loading maintenance requests:", error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await maintenanceService.updateStatus(id, newStatus);
            toast.success(`Request marked as ${newStatus}`);
            loadRequests();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const filteredRequests = filter === 'All'
        ? requests
        : requests.filter(req => req.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return '#4ade80';
            case 'In Progress': return '#facc15';
            default: return '#f87171';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'Resolved': return 'rgba(74, 222, 128, 0.15)';
            case 'In Progress': return 'rgba(250, 204, 21, 0.15)';
            default: return 'rgba(248, 113, 113, 0.15)';
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:8082${path}`;
    };

    // Styling constants reused from AdminLostFound for consistency
    const containerStyle = {
        minHeight: '100vh',
        padding: '30px',
        backgroundColor: '#121212',
        color: '#e0e0e0',
        fontFamily: "'Inter', sans-serif",
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        background: 'rgba(30, 30, 30, 0.5)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
    };

    const cardStyle = {
        backgroundColor: 'rgba(30, 30, 30, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '25px',
        marginBottom: '25px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    };

    return (
        <div style={containerStyle}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={headerStyle}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => navigate('/admin')}
                        style={{ background: 'none', border: 'none', color: '#e0e0e0', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', background: 'linear-gradient(90deg, #fff, #a5a5a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaTools /> Maintenance Console
                    </h1>
                </div>
                <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={cardStyle}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                    <h3 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Request Queue
                    </h3>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <FaFilter style={{ position: 'absolute', left: '12px', top: '12px', color: '#aaa' }} />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{
                                    padding: '10px 10px 10px 35px',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="All" style={{ color: 'black' }}>All Status</option>
                                <option value="Pending" style={{ color: 'black' }}>Pending</option>
                                <option value="In Progress" style={{ color: 'black' }}>In Progress</option>
                                <option value="Resolved" style={{ color: 'black' }}>Resolved</option>
                            </select>
                        </div>
                        <button onClick={loadRequests} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {loading ? <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>Loading requests...</div> : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>Request Info</th>
                                    <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>User Details</th>
                                    <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>Status</th>
                                    <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map(req => (
                                    <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <span style={{
                                                    background: req.type === 'Issue' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                    color: req.type === 'Issue' ? '#f87171' : '#60a5fa',
                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.7em', fontWeight: 'bold'
                                                }}>
                                                    {req.type}
                                                </span>
                                                <span style={{ fontSize: '0.85em', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FaCalendarAlt size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '0.95em', lineHeight: '1.5', color: '#ddd' }}>{req.description}</p>
                                            {req.photoUrl && (
                                                <button
                                                    onClick={() => setSelectedImage(getImageUrl(req.photoUrl))}
                                                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#818cf8', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    View Attachment
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.9em' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#fff' }}>
                                                    <FaUser color="#aaa" size={12} /> {req.userName || 'Unknown'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa' }}>
                                                    <FaEnvelope size={12} /> {req.userEmail}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa' }}>
                                                    <FaPhone size={12} /> {req.userPhone}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <span style={{
                                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em',
                                                background: getStatusBg(req.status),
                                                color: getStatusColor(req.status),
                                                fontWeight: '600', border: `1px solid ${getStatusColor(req.status)}40`,
                                                display: 'inline-flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                {req.status === 'Resolved' ? <FaCheckCircle /> : req.status === 'In Progress' ? <FaTools /> : <FaExclamationCircle />}
                                                {req.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                                {req.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.id, 'In Progress')}
                                                        style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        🚧 Start Work
                                                    </button>
                                                )}
                                                {req.status !== 'Resolved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(req.id, 'Resolved')}
                                                        style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        ✅ Mark Resolved
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRequests.length === 0 && (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No requests found in this category.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.9)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(5px)'
                        }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ position: 'relative', maxWidth: '90%' }}
                        >
                            <img
                                src={selectedImage}
                                alt="Attachment"
                                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                style={{
                                    position: 'absolute', top: '-40px', right: '0',
                                    background: 'none', color: 'white', border: 'none',
                                    fontSize: '1.2rem', cursor: 'pointer'
                                }}
                            >
                                Close ✕
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminMaintenance;
