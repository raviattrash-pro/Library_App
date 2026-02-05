import React, { useState, useEffect } from 'react';
import printService from '../../services/printService';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPrint, FaFileAlt, FaMoneyBillWave, FaHistory, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';

const PrintServicePage = () => {
    const [user, setUser] = useState(null);
    const [printType, setPrintType] = useState('Black & White');
    const [copies, setCopies] = useState(1);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [payment, setPayment] = useState(null);
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [qrCode, setQrCode] = useState(null);
    const [settings, setSettings] = useState({ blackAndWhiteCost: 2, colorCost: 10 });
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        fetchQrCode();
        loadSettings();
    }, []);

    useEffect(() => {
        if (user && user.userId) {
            loadRequests();
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            const data = await printService.getSettings();
            if (data) setSettings(data);
        } catch (error) {
            console.error("Error loading print settings:", error);
        }
    };

    const fetchQrCode = async () => {
        try {
            const response = await qrService.getQRCode();
            setQrCode(response.data);
        } catch (error) {
            console.error("Error fetching QR code:", error);
        }
    };

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await printService.getRequestsByUser(user.userId);
            // Sort by most recent
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(data);
        } catch (error) {
            console.error("Error loading print requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateCost = () => {
        const rate = printType === 'Color' ? settings.colorCost : settings.blackAndWhiteCost;
        return rate * copies;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!selectedDoc || !payment) {
            setMessage('Please upload both document and payment screenshot.');
            return;
        }

        try {
            await printService.createRequest(user.userId, printType, copies, calculateCost(), selectedDoc, payment);
            setMessage('Print request submitted successfully!');
            setSelectedDoc(null);
            setPayment(null);
            setCopies(1);
            // Reset file inputs
            const docInput = document.getElementById('documentInput');
            const payInput = document.getElementById('paymentInput');
            if (docInput) docInput.value = '';
            if (payInput) payInput.value = '';

            loadRequests();
        } catch (error) {
            console.error("Error submitting request:", error);
            setMessage("Failed to submit request.");
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            padding: '40px 20px',
            backgroundColor: '#121212',
            color: '#e0e0e0',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden',
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '500px',
            background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 70%)',
            zIndex: 0,
            pointerEvents: 'none',
        },
        header: {
            marginBottom: '40px',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center'
        },
        backButton: {
            position: 'absolute',
            left: 0,
            top: 0,
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
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
        },
        card: {
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            height: 'fit-content',
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
            marginBottom: '20px',
        },
        qrSection: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            marginBottom: '20px',
            textAlign: 'center',
        },
        submitButton: {
            width: '100%',
            padding: '14px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        historyItem: {
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.overlay}></div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.header}
            >
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    <FaArrowLeft /> Back
                </button>
                <h1 style={styles.title}>Print Service</h1>
                <p style={{ color: '#888' }}>Upload documents for printing and track requests.</p>
            </motion.div>

            <div style={styles.grid}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={styles.card}
                >
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaPrint color="#60a5fa" /> New Request
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Print Type</label>
                                <select
                                    value={printType}
                                    onChange={(e) => setPrintType(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="Black & White">Black & White (Rs. {settings.blackAndWhiteCost})</option>
                                    <option value="Color">Color (Rs. {settings.colorCost})</option>
                                </select>
                            </div>
                            <div style={{ width: '100px' }}>
                                <label style={styles.label}>Copies</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={copies}
                                    onChange={(e) => setCopies(parseInt(e.target.value))}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <label style={styles.label}>Upload Document (PDF/Doc)</label>
                        <input id="documentInput" type="file" onChange={(e) => setSelectedDoc(e.target.files[0])} style={{ ...styles.input, padding: '9px' }} />

                        <div style={styles.qrSection}>
                            <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '5px' }}>Total Cost: <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Rs. {calculateCost()}</span></p>
                            <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '15px' }}>
                                Scan to Pay: <strong style={{ color: '#e0e0e0' }}>{qrCode ? qrCode.upiId : 'Loading...'}</strong>
                            </p>
                            {qrCode && qrCode.imageUrl ? (
                                <img src={qrCode.imageUrl} alt="UPI QR" style={{ width: '120px', borderRadius: '8px' }} />
                            ) : (
                                <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                    Loading QR...
                                </div>
                            )}
                        </div>

                        <label style={styles.label}>Upload Payment Screenshot</label>
                        <input id="paymentInput" type="file" onChange={(e) => setPayment(e.target.files[0])} accept="image/*" style={{ ...styles.input, padding: '9px' }} />

                        <button type="submit" style={styles.submitButton}>
                            <FaMoneyBillWave style={{ marginRight: '8px' }} /> Submit & Pay
                        </button>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: message.includes('Failed') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.includes('Failed') ? '#f87171' : '#34d399', textAlign: 'center', fontSize: '0.9rem' }}
                            >
                                {message}
                            </motion.div>
                        )}
                    </form>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    style={styles.card}
                >
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHistory color="#a78bfa" /> Request History
                    </h3>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Loading requests...</div>
                    ) : requests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No print requests found.</div>
                    ) : (
                        <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                            {requests.map(req => (
                                <div key={req.id} style={styles.historyItem}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#fff', fontWeight: '500', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FaFileAlt size={12} color="#aaa" /> {req.fileName}
                                        </div>
                                        <div style={{ fontSize: '0.85em', color: '#888' }}>
                                            {req.printType} • {req.copies} copies • Rs. {req.resultCost}
                                        </div>
                                        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '2px' }}>
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.8em',
                                            backgroundColor: req.status === 'Completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                            color: req.status === 'Completed' ? '#4ade80' : '#facc15',
                                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px'
                                        }}>
                                            {req.status === 'Completed' ? <FaCheckCircle /> : <FaExclamationCircle />} {req.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PrintServicePage;
