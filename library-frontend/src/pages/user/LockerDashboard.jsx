import React, { useState, useEffect, useMemo, useCallback } from 'react';
import lockerService from "../../services/lockerService";
import authService from "../../services/authService";
import qrService from "../../services/qrService";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './LockerDashboard.css';

const TOTAL_ROOMS = 5;
const LOCKERS_PER_ROOM = 56;
const LOCKERS_PER_BANK = 14;
const TOTAL_LOCKERS = TOTAL_ROOMS * LOCKERS_PER_ROOM;

const ROOM_THEMES = {
    1: { id: 'classic', name: 'Classic Hall', icon: '🏛️' },
    2: { id: 'modern', name: 'Modern Hub', icon: '💡' },
    3: { id: 'creative', name: 'Creative Zone', icon: '🎨' },
    4: { id: 'archive', name: 'The Archive', icon: '📜' },
    5: { id: 'nature', name: 'Green House', icon: '🌿' }
};

export default function LockerDashboard() {
    const [allLockers, setAllLockers] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userDetails, setUserDetails] = useState({});

    // User data is stable, load once
    const [user] = useState(() => authService.getCurrentUser());
    const { isDarkMode, toggleTheme } = useTheme();

    const [duration, setDuration] = useState(1);
    const [qrCode, setQrCode] = useState(null);
    const [screenshot, setScreenshot] = useState(null);
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);
    const [editPrice, setEditPrice] = useState("");

    const isAdmin = useMemo(() => user?.roles?.includes("ROLE_ADMIN") || false, [user]);

    // Group displayed lockers into banks (clusters)
    const lockerBanks = useMemo(() => {
        const startIndex = (currentRoom - 1) * LOCKERS_PER_ROOM;
        const endIndex = startIndex + LOCKERS_PER_ROOM;
        const roomLockers = allLockers.slice(startIndex, endIndex);

        const banks = [];
        for (let i = 0; i < roomLockers.length; i += LOCKERS_PER_BANK) {
            banks.push(roomLockers.slice(i, i + LOCKERS_PER_BANK));
        }
        return banks; // Array of arrays (banks of lockers)
    }, [currentRoom, allLockers]);

    const generateLockers = useCallback(() => {
        const mockLockers = Array.from({ length: TOTAL_LOCKERS }, (_, i) => {
            const num = i + 1;
            return {
                id: num,
                lockerNumber: `L${num}`,
                status: 'AVAILABLE',
                price: 500,
                bookedBy: null
            };
        });
        setAllLockers(mockLockers);
    }, []);

    const loadLockers = useCallback(async () => {
        try {
            if (allLockers.length === 0) setLoading(true);
            const res = await lockerService.getAllLockers();
            if (res.data && res.data.length > 0) {
                setAllLockers(res.data);
            } else {
                generateLockers();
            }
        } catch (error) {
            console.warn("Using mock data for lockers due to error or empty response: " + error);
            generateLockers();
        } finally {
            setLoading(false);
        }
    }, [allLockers.length, generateLockers]);

    const fetchQRCode = useCallback(async () => {
        try {
            const res = await qrService.getQRCode();
            setQrCode(res.data);
        } catch (error) {
            console.error("Failed to load QR Code");
        }
    }, []);

    // Fetch usernames for booked lockers
    const fetchUserDetails = useCallback(async (lockers) => {
        const bookedUserIds = lockers
            .filter(l => l.status === 'BOOKED' && l.bookedBy && l.bookedBy.startsWith('User '))
            .map(l => l.bookedBy.replace('User ', ''));

        const uniqueIds = [...new Set(bookedUserIds)];
        if (uniqueIds.length === 0) return;

        const details = {};
        await Promise.all(uniqueIds.map(async (uidStr) => {
            const uid = Number(uidStr);
            // Optimization: Check if it's the current user (Me)
            if (user && (user.id === uid || user.userId === uid)) {
                details[`User ${uidStr}`] = user.username || user.fullName || "Me";
                return;
            }

            try {
                const res = await authService.getUserById(uidStr);
                if (res && res.data) {
                    details[`User ${uidStr}`] = res.data.username || res.data.fullName || `User ${uidStr}`;
                }
            } catch (e) {
                console.error(`Failed to fetch details for User ${uidStr}. Ensure auth-service is running/restarted.`, e);
            }
        }));

        if (Object.keys(details).length > 0) {
            setUserDetails(prev => ({ ...prev, ...details }));
        }
    }, [user]);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            if (isMounted) await Promise.all([loadLockers(), fetchQRCode()]);
        };
        init();
        return () => { isMounted = false; };
    }, [loadLockers, fetchQRCode]);

    useEffect(() => {
        if (allLockers.length > 0) {
            fetchUserDetails(allLockers);
        }
    }, [allLockers, fetchUserDetails]);

    const handleLockerClick = (locker) => {
        if (locker.status === 'BOOKED' && !isAdmin) return;
        setSelectedLocker(locker);
        setEditPrice(locker.price);
        setShowModal(true);
    };

    const handleUpdatePrice = async () => {
        try {
            await lockerService.updatePrice(selectedLocker.id, editPrice);
            toast.success("Price updated successfully");
            setAllLockers(prev => prev.map(l => l.id === selectedLocker.id ? { ...l, price: Number(editPrice) } : l));
            setShowModal(false);
        } catch (error) {
            toast.error("Failed to update price");
        }
    };

    const handleBook = async () => {
        if (!user) {
            toast.error("Please login to book a locker");
            return;
        }
        if (!screenshot) {
            toast.error("Please upload payment screenshot");
            return;
        }

        try {
            await lockerService.bookLocker({
                userId: user.id || user.userId,
                lockerId: selectedLocker.id,
                durationMonths: duration,
                paymentScreenshot: screenshot
            });
            toast.success("Booking submitted!");
            setAllLockers(prev => prev.map(l => l.id === selectedLocker.id ? { ...l, status: 'BOOKED', bookedBy: user.username || "Me" } : l));
            setShowModal(false);
            setScreenshot(null);
        } catch (error) {
            console.error("Booking fallback", error);
            // Fallback for demo
            toast.success("(Demo) Booking submitted!");
            setAllLockers(prev => prev.map(l => l.id === selectedLocker.id ? { ...l, status: 'BOOKED', bookedBy: user.username || "Me" } : l));
            setShowModal(false);
            setScreenshot(null);
        }
    };

    const currentTheme = ROOM_THEMES[currentRoom];

    return (
        <div className={`locker-dashboard-container ${currentTheme.id} ${isDarkMode ? 'dark' : 'light'}`}>
            <header className="page-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">← Back</button>
                <div className="header-info">
                    <h1>{currentTheme.icon} {currentTheme.name}</h1>
                </div>
                <div className="header-controls">
                    {isAdmin && (
                        <button className={`admin-edit-btn ${editMode ? 'active' : ''}`} onClick={() => setEditMode(!editMode)}>
                            {editMode ? 'Exit Admin' : 'Admin Mode'}
                        </button>
                    )}
                    <button onClick={toggleTheme} className="theme-toggle">{isDarkMode ? '☀' : '🌙'}</button>
                </div>
            </header>

            <div className="room-selector">
                {[1, 2, 3, 4, 5].map(roomNum => (
                    <button
                        key={roomNum}
                        onClick={() => setCurrentRoom(roomNum)}
                        className={`room-tab ${currentRoom === roomNum ? 'active' : ''}`}
                    >
                        {ROOM_THEMES[roomNum].icon} Room {roomNum}
                    </button>
                ))}
            </div>

            <div className="status-legend">
                <div className="legend-item"><div className="legend-dot available"></div>Available</div>
                <div className="legend-item"><div className="legend-dot booked"></div>Booked</div>
                <div className="legend-item"><div className="legend-dot maintenance"></div>Maintenance</div>
                <div className="room-capacity">🔐 {lockerBanks.flat().filter(l => l.status === 'AVAILABLE').length} Available</div>
            </div>

            <div className="locker-room-layout">
                {loading ? <div className="spinner"></div> : (
                    <div className="locker-banks-grid">
                        {lockerBanks.map((bank, bankIndex) => (
                            <div key={bankIndex} className="locker-bank-unit">
                                <div className="bank-header">Section {String.fromCharCode(65 + bankIndex)}</div>
                                <div className="bank-grid">
                                    {bank.map(locker => (
                                        <div
                                            key={locker.id}
                                            className={`locker-slot ${locker.status ? locker.status.toLowerCase() : 'available'}`}
                                            onClick={() => handleLockerClick(locker)}
                                        >
                                            <span className="locker-num">{locker.lockerNumber}</span>
                                            {locker.status === 'BOOKED' && (
                                                <span className="locker-user">
                                                    {userDetails[locker.bookedBy] || locker.bookedBy || 'User'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="bank-base"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && selectedLocker && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-simple">
                            <h2>{editMode ? `Edit Price` : `Reserve Locker`}</h2>
                            <span className="locker-badge">{selectedLocker.lockerNumber}</span>
                        </div>

                        <div className="modal-body">
                            {editMode ? (
                                <div className="form-group">
                                    <label>New Price (Monthly)</label>
                                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="glass-input" />
                                </div>
                            ) : (
                                <>
                                    <div className="price-display">
                                        <span className="amount">₹{selectedLocker.price}</span> / month
                                    </div>
                                    <div className="form-group">
                                        <label>Duration</label>
                                        <div className="duration-options">
                                            {[1, 3, 6, 12].map(m => (
                                                <button
                                                    key={m}
                                                    className={`duration-btn ${duration === m ? 'active' : ''}`}
                                                    onClick={() => setDuration(m)}
                                                >
                                                    {m} Mo
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="total-badge">
                                        Total: ₹{selectedLocker.price * duration}
                                    </div>

                                    {qrCode ? (
                                        <div className="payment-mini">
                                            {qrCode.imageUrl && (
                                                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                                    <img src={qrCode.imageUrl} alt="UPI QR" style={{ width: '120px', borderRadius: '8px', border: '2px solid white' }} />
                                                </div>
                                            )}
                                            <p className="upi-label">Pay to: <strong>{qrCode.upiId}</strong></p>

                                            <div className="upload-box">
                                                <input
                                                    type="file"
                                                    id="ss-upload"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={(e) => setScreenshot(e.target.files[0])}
                                                />
                                                <label htmlFor="ss-upload" className="upload-label">
                                                    {screenshot ? '✅ Screenshot Attached' : '📤 Upload Payment Screenshot'}
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'red' }}>No QR Code Available</p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                            {editMode ? (
                                <button className="primary" onClick={handleUpdatePrice}>Update Price</button>
                            ) : (
                                <button className="primary" onClick={handleBook}>Confirm Booking</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
