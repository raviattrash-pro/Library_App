import React, { useState, useEffect } from 'react';
import maintenanceService from '../../services/maintenanceService';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaTools, FaCommentAlt, FaPaperclip, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const MaintenancePage = () => {
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('Issue');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    useEffect(() => {
        if (user && user.userId) {
            loadRequests();
        }
    }, [user]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await maintenanceService.getRequestsByUser(user.userId);
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(data);
        } catch (error) {
            console.error("Error loading maintenance requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description) {
            toast.warning("Description is required.");
            return;
        }

        try {
            await maintenanceService.createRequest(user.userId, user.username, user.email, user.phone, type, description, image);
            toast.success("Request submitted successfully!");
            setDescription('');
            setImage(null);
            document.getElementById('fileInput').value = '';
            loadRequests();
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error("Failed to submit request.");
        }
    };

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return '#4ade80';
            case 'In Progress': return '#facc15';
            default: return '#94a3b8';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'Resolved': return 'rgba(34, 197, 94, 0.2)';
            case 'In Progress': return 'rgba(234, 179, 8, 0.2)';
            default: return 'rgba(148, 163, 184, 0.2)';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.overlay}></div>

            <div style={styles.header}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={styles.backButton}
                >
                    <FaArrowLeft /> Back
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}
            >
                <h1 style={styles.title}>Maintenance & Feedback</h1>
                <p style={styles.subtitle}>Report issues or share your thoughts to help us improve.</p>
            </motion.div>

            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: '40px', position: 'relative', zIndex: 1 }}>

                {/* Submit Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={styles.card}
                >
                    <h2 style={styles.cardHeader}>
                        <FaTools color="#60a5fa" /> Submit New Request
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
                            <div>
                                <label style={styles.label}>Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="Issue">Report Issue</option>
                                    <option value="Feedback">Provide Feedback</option>
                                </select>
                            </div>
                            <div>
                                <label style={styles.label}>Attachment (Optional)</label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ ...styles.input, padding: '9px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={styles.label}>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                                placeholder="Describe the issue or feedback in detail..."
                            />
                        </div>

                        <button type="submit" style={styles.submitButton}>
                            Submit Request
                        </button>
                    </form>
                </motion.div>

                {/* History */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={styles.card}
                >
                    <h3 style={styles.cardHeader}>
                        <FaCommentAlt color="#a78bfa" /> History
                    </h3>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Loading...</div>
                    ) : requests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            No requests submitted yet.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {requests.map(req => (
                                <motion.div
                                    key={req.id}
                                    whileHover={{ scale: 1.01 }}
                                    style={styles.historyItem}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <span style={{
                                                background: req.type === 'Issue' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                                color: req.type === 'Issue' ? '#f87171' : '#60a5fa',
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.75em', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>
                                                {req.type}
                                            </span>
                                            <span style={{ color: '#666', fontSize: '0.85em' }}>
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ color: '#e0e0e0', margin: '0 0 10px 0', lineHeight: '1.5' }}>{req.description}</p>
                                        {req.photoUrl && (
                                            <a
                                                href={`http://localhost:8082${req.photoUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#818cf8', fontSize: '0.9em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <FaPaperclip size={12} /> View Attachment
                                            </a>
                                        )}
                                    </div>
                                    <div style={{ marginLeft: '20px' }}>
                                        <span style={{
                                            padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em',
                                            background: getStatusBg(req.status),
                                            color: getStatusColor(req.status),
                                            fontWeight: '600',
                                            display: 'flex', alignItems: 'center', gap: '5px'
                                        }}>
                                            {req.status === 'Resolved' && <FaCheckCircle />}
                                            {req.status === 'In Progress' && <FaTools />}
                                            {req.status === 'Pending' && <FaExclamationCircle />}
                                            {req.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: '#121212',
        color: '#e0e0e0',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden', // Prevent scrollbars from background effects
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '500px',
        background: 'radial-gradient(circle at 50% 0%, rgba(52, 211, 153, 0.05), transparent 70%)', // Slightly green tinted for maintenance
        zIndex: 0,
        pointerEvents: 'none',
    },
    header: {
        marginBottom: '20px',
        position: 'relative',
        zIndex: 2,
    },
    backButton: {
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
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #fff 0%, #a5a5a5 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#888',
    },
    card: {
        backgroundColor: 'rgba(30, 30, 30, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    },
    cardHeader: {
        fontSize: '1.5rem',
        marginBottom: '25px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#aaa',
        fontSize: '0.9rem',
    },
    input: {
        width: '100%',
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    submitButton: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#10b981', // Emerald green
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
    },
    historyItem: {
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.3s',
    },
};

export default MaintenancePage;
