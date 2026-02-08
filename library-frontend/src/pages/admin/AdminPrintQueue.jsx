import React, { useState, useEffect } from 'react';
import printService from '../../services/printService';
import authService from '../../services/authService';
import config from '../../config';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPrint, FaFileAlt, FaCheck, FaTimes, FaExchangeAlt, FaUser, FaPhone, FaEnvelope, FaArrowLeft, FaCog, FaSave } from 'react-icons/fa';

const AdminPrintQueue = () => {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({ blackAndWhiteCost: 2, colorCost: 10 });
    const navigate = useNavigate();

    useEffect(() => {
        loadRequests();
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await printService.getSettings();
            if (data) setSettings(data);
        } catch (error) {
            console.error("Error loading print settings:", error);
        }
    };

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await printService.getAllRequests();
            // Sort by Pending first, then date
            data.sort((a, b) => {
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setRequests(data);

            // Extract unique user IDs
            const userIds = [...new Set(data.map(req => req.userId))];
            fetchUserDetails(userIds);
        } catch (error) {
            console.error("Error loading print queue:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userIds) => {
        const userMap = { ...users }; // Keep existing users
        const newIds = userIds.filter(id => !userMap[id]);

        if (newIds.length === 0) return;

        try {
            // Fetch users in parallel
            await Promise.all(newIds.map(async (id) => {
                try {
                    const response = await authService.getUserById(id);
                    userMap[id] = response.data; // Axios response structure
                } catch (err) {
                    console.error(`Failed to fetch user ${id}`, err);
                    userMap[id] = { username: 'Unknown', email: 'N/A', phone: 'N/A' };
                }
            }));
            setUsers(userMap);
        } catch (error) {
            console.error("Error user details:", error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await printService.updateStatus(id, status);
            loadRequests(); // Reload to refresh sorting and status
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            await printService.updateSettings(settings.blackAndWhiteCost, settings.colorCost);
            alert("Pricing updated successfully!");
            setShowSettings(false);
        } catch (error) {
            console.error("Error updating settings:", error);
            alert("Failed to update pricing.");
        }
    };

    const styles = {
        container: {
            padding: '20px',
            color: '#e0e0e0',
            fontFamily: "'Inter', sans-serif",
            minHeight: '80vh',
            maxWidth: '1200px',
            margin: '0 auto',
        },
        card: {
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            overflowX: 'auto',
            marginBottom: '30px',
        },
        headerBtn: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#e0e0e0',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            transition: 'background 0.3s',
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 10px',
        },
        th: {
            padding: '15px',
            textAlign: 'left',
            color: '#a0a0a0',
            fontWeight: '600',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
        },
        tr: {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            transition: 'transform 0.2s',
        },
        td: {
            padding: '15px',
            verticalAlign: 'middle',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
        link: {
            color: '#60a5fa',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
        },
        statusBadge: (status) => ({
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.85em',
            fontWeight: '600',
            backgroundColor: status === 'Completed' ? 'rgba(34, 197, 94, 0.2)' :
                status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' :
                    status === 'Verified' ? 'rgba(59, 130, 246, 0.2)' :
                        status === 'Printed' ? 'rgba(168, 85, 247, 0.2)' :
                            'rgba(148, 163, 184, 0.2)',
            color: status === 'Completed' ? '#4ade80' :
                status === 'Pending' ? '#facc15' :
                    status === 'Verified' ? '#60a5fa' :
                        status === 'Printed' ? '#c084fc' :
                            '#94a3b8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
        }),
        actionBtn: (color) => ({
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85em',
            backgroundColor: color,
            marginRight: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'opacity 0.2s'
        }),
        input: {
            width: '100%',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
        }
    };

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/admin')} style={styles.headerBtn}>
                        <FaArrowLeft /> Back
                    </button>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center' }}>
                        <FaPrint size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Print Queue</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#888' }}>Manage print requests</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    style={{ ...styles.headerBtn, background: showSettings ? 'rgba(99, 102, 241, 0.3)' : styles.headerBtn.background }}
                >
                    <FaCog /> Pricing Settings
                </button>
            </div>

            {showSettings && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginBottom: '30px', ...styles.card }}
                >
                    <h3 style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Configure Print Pricing</h3>
                    <form onSubmit={handleUpdateSettings} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>B&W Cost (Rs.)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.blackAndWhiteCost}
                                onChange={(e) => setSettings({ ...settings, blackAndWhiteCost: parseFloat(e.target.value) })}
                                style={styles.input}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '0.9rem' }}>Color Cost (Rs.)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.colorCost}
                                onChange={(e) => setSettings({ ...settings, colorCost: parseFloat(e.target.value) })}
                                style={styles.input}
                            />
                        </div>
                        <button type="submit" style={{ ...styles.actionBtn('#3b82f6'), padding: '12px 24px', fontSize: '1rem' }}>
                            <FaSave /> Save Changes
                        </button>
                    </form>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.card}
            >
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading requests...</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>User Details</th>
                                <th style={styles.th}>Request Info</th>
                                <th style={styles.th}>Files</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req, index) => {
                                const user = users[req.userId] || { firstName: 'User', lastName: req.userId, email: 'Loading...' };
                                const fullName = user.firstName ? `${user.firstName} ${user.lastName}` : user.username || `User ${req.userId}`;

                                // Prefix backend URL for files
                                const formatUrl = (path) => {
                                    if (!path) return '#';
                                    if (path.startsWith('http')) return path;
                                    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
                                    const baseUrl = config.API_BASE_URL.endsWith('/') ? config.API_BASE_URL : `${config.API_BASE_URL}/`;
                                    return `${baseUrl}${cleanPath}`;
                                };

                                const fileUrl = formatUrl(req.fileUrl);
                                const paymentUrl = formatUrl(req.paymentScreenshotUrl);

                                return (
                                    <motion.tr
                                        key={req.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={styles.tr}
                                    >
                                        <td style={{ ...styles.td, borderRadius: '12px 0 0 12px' }}>
                                            <div style={{ fontWeight: '500', color: '#fff' }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.85em', color: '#888' }}>{new Date(req.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                    <FaUser size={12} />
                                                </div>
                                                <div>
                                                    <div style={{ color: '#fff', fontWeight: '500' }}>{fullName}</div>
                                                    <div style={{ fontSize: '0.8em', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FaEnvelope size={10} /> {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div style={{ fontSize: '0.8em', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <FaPhone size={10} /> {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ color: '#e0e0e0' }}>{req.printType}</div>
                                            <div style={{ fontSize: '0.9em', color: '#888' }}>{req.copies} copies • <span style={{ color: '#818cf8', fontWeight: 'bold' }}>Rs. {req.resultCost}</span></div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {req.fileName && (
                                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                                        <FaFileAlt /> Doc: {req.fileName.substring(0, 15)}...
                                                    </a>
                                                )}
                                                {req.paymentScreenshotUrl && (
                                                    <a href={paymentUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                                        <FaFileAlt /> Payment Screenshot
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.statusBadge(req.status)}>
                                                {req.status === 'Completed' && <FaCheck size={10} />}
                                                {req.status === 'Pending' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#facc15' }}></span>}
                                                {req.status}
                                            </span>
                                        </td>
                                        <td style={{ ...styles.td, borderRadius: '0 12px 12px 0' }}>
                                            {req.status === 'Pending' && (
                                                <button onClick={() => handleStatusUpdate(req.id, 'Verified')} style={styles.actionBtn('#0ea5e9')}>
                                                    <FaCheck /> Verify
                                                </button>
                                            )}
                                            {req.status === 'Verified' && (
                                                <button onClick={() => handleStatusUpdate(req.id, 'Printed')} style={styles.actionBtn('#8b5cf6')}>
                                                    <FaPrint /> Print
                                                </button>
                                            )}
                                            {req.status === 'Printed' && (
                                                <button onClick={() => handleStatusUpdate(req.id, 'Completed')} style={styles.actionBtn('#22c55e')}>
                                                    <FaCheck /> Complete
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {!loading && requests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                        <FaExchangeAlt size={40} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <p>No print requests found</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminPrintQueue;
