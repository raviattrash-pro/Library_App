import React, { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import authService from '../../services/authService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { FaQrcode, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaCamera, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AttendanceScanner = () => {
    const [user, setUser] = useState(null);
    const [currentSession, setCurrentSession] = useState(null);
    const [stats, setStats] = useState({ totalMinutes: 0, formattedTime: '0h 00m' });
    const [message, setMessage] = useState('');
    const [scanning, setScanning] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            // Load session independently so it updates even if stats fail
            try {
                const sessionData = await attendanceService.getCurrentSession(user.userId);
                setCurrentSession(sessionData);
            } catch (err) {
                console.error("Error loading session:", err);
            }

            try {
                const statsData = await attendanceService.getSummary(user.userId);
                setStats(statsData);
            } catch (err) {
                console.error("Error loading stats:", err);
            }
        } catch (error) {
            console.error("Critical error loading data:", error);
        }
    };

    const handleScanSuccess = async (decodedText) => {
        console.log(`Scan result: ${decodedText}`);
        // Handle scan
        try {
            setScanning(false);
            // Stop scanner if possible, but Html5QrcodeScanner handles it via clear() but we are unmounting component or hiding it.
            // Actually, we should probably clear it. 
            // Better to let the user close it or auto-close.

            const result = await attendanceService.scanQr(user.userId, decodedText);

            let msg = '';
            if (result.checkOutTime) {
                msg = `Checked out from ${result.seatId}`;
            } else {
                msg = `Checked into ${result.seatId}`;
            }
            setMessage(msg);
            loadData(); // Refresh state
        } catch (error) {
            console.error("Scan error processing:", error);
            setMessage("Failed to process: " + error.message);
        }
    };

    useEffect(() => {
        let scanner = null;
        let isMounted = true;

        if (scanning) {
            // Give a small delay for the DOM element to be ready
            setTimeout(() => {
                if (!isMounted || !document.getElementById("reader")) return;

                try {
                    scanner = new Html5QrcodeScanner(
                        "reader",
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        /* verbose= */ false
                    );
                    scanner.render(handleScanSuccess, (error) => {
                        // console.warn(error); // Ignore scan failures (frame by frame)
                    });
                } catch (e) {
                    console.error("Scanner init error", e);
                }
            }, 100);
        }

        return () => {
            isMounted = false;
            if (scanner) {
                try {
                    scanner.clear().catch(error => console.warn("Failed to clear scanner", error));
                } catch (e) {
                    console.warn("Scanner clear error", e);
                }
            }
        };
    }, [scanning]);

    const styles = {
        container: {
            minHeight: '100vh',
            padding: '20px',
            background: '#121212',
            color: '#e0e0e0',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
        },
        header: {
            width: '100%',
            maxWidth: '600px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        backButton: {
            position: 'absolute',
            left: 0,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        card: {
            background: 'rgba(30, 30, 30, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '30px',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            marginBottom: '20px',
        },
        scanButton: {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '50px',
            padding: '15px 40px',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto',
        },
        statsValue: {
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #4ade80, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '10px 0',
        },
        statusBadge: (isActive) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
            color: isActive ? '#4ade80' : '#94a3b8',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '20px',
        })
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
                    <FaArrowLeft /> Back
                </button>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Desk Attendance</h2>
            </div>

            {/* Daily Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.card}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#aaa', marginBottom: '5px' }}>
                    <FaHourglassHalf /> Today's Focus
                </div>
                <div style={styles.statsValue}>{stats.formattedTime}</div>
                <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Keep up the good work!</p>
            </motion.div>

            {/* Current Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={styles.card}
            >
                <div style={styles.statusBadge(!!currentSession)}>
                    {currentSession ? <FaCheckCircle /> : <FaTimesCircle />}
                    {currentSession ? 'Checked In' : 'Not Checked In'}
                </div>

                {currentSession ? (
                    <div>
                        <h3 style={{ fontSize: '2rem', margin: '0 0 10px 0', color: '#fff' }}>{currentSession.seatId}</h3>
                        <p style={{ color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <FaClock /> Since {new Date(currentSession.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p style={{ marginTop: '20px', color: '#818cf8', fontSize: '0.9rem' }}>Scan again to check out</p>
                    </div>
                ) : (
                    <div>
                        <FaQrcode size={60} color="#333" style={{ margin: '20px 0' }} />
                        <p style={{ color: '#aaa', marginBottom: '20px' }}>Scan the QR code on your desk to start your session.</p>
                    </div>
                )}

                {!scanning && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setScanning(true)}
                        style={styles.scanButton}
                    >
                        <FaCamera /> {currentSession ? 'Scan to Check Out' : 'Scan to Check In'}
                    </motion.button>
                )}
            </motion.div>

            {/* Scanner Modal Area */}
            {scanning && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', zIndex: 1000,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ width: '300px', background: '#fff', padding: '10px', borderRadius: '10px' }}>
                        <div id="reader" width="300px"></div>
                    </div>
                    <button
                        onClick={() => setScanning(false)}
                        style={{ marginTop: '20px', background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}
                    >
                        Close Camera
                    </button>
                </div>
            )}

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '15px 20px',
                        borderRadius: '12px',
                        background: message.includes('Failed') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: message.includes('Failed') ? '#f87171' : '#4ade80',
                        marginTop: '20px',
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                >
                    {message.includes('Failed') ? <FaTimesCircle /> : <FaCheckCircle />}
                    {message}
                </motion.div>
            )}
        </div>
    );
};

export default AttendanceScanner;
