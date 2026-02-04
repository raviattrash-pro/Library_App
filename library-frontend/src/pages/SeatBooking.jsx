import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import seatService from '../services/seatService';
import shiftService from '../services/shiftService';
import bookingService from '../services/bookingService';
import qrService from '../services/qrService';
import authService from '../services/authService';
import { toast } from 'react-toastify';
import './SeatBooking.css';

const TABLES_COUNT = 8;
const CHAIRS_PER_TABLE = 6;
const TEACHER_SEATS_COUNT = 8;

const ROOM_THEMES = {
    'A': { id: 'classic', name: 'Classic Library', icon: '🏛️', decor: ['📚', '🕯️'] },
    'B': { id: 'modern', name: 'Modern Study', icon: '💡', decor: ['💻', '🥤'] },
    'C': { id: 'creative', name: 'Creative Commons', icon: '🎨', decor: ['✏️', '🎧'] },
    'D': { id: 'archive', name: 'The Archive', icon: '📜', decor: ['🗞️', '👓'] },
    'E': { id: 'nature', name: 'Nature Garden', icon: '🌿', decor: ['🪴', '🌻'] }
};

export default function SeatBooking() {
    const [allSeats, setAllSeats] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [paymentScreenshot, setPaymentScreenshot] = useState('');
    const [room, setRoom] = useState('A');
    const [selected, setSelected] = useState(null);
    const [modal, setModal] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [form, setForm] = useState({
        shiftId: '',
        duration: '1 Month',
        startDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [rawSeats, setRawSeats] = useState([]);
    const [selectedShiftId, setSelectedShiftId] = useState('');
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => { loadData(); }, []);

    // Re-calculate seat statuses based on shift/bookings
    useEffect(() => {
        if (rawSeats.length > 0) {
            applySeatStatus();
        }
    }, [bookings, selectedShiftId, rawSeats]);

    const loadData = async () => {
        try {
            const [seatsRes, shiftsRes, qrRes, bookingsRes] = await Promise.all([
                seatService.getAllSeats(),
                shiftService.getAllShifts(),
                qrService.getQRCode().catch(() => ({ data: null })),
                bookingService.getAllBookings().catch(() => ({ data: [] }))
            ]);

            setRawSeats(seatsRes.data);
            setAllSeats(seatsRes.data);
            setShifts(shiftsRes.data);

            if (shiftsRes.data.length > 0) {
                const defaultShift = shiftsRes.data[0].id;
                setSelectedShiftId(defaultShift);
                setForm(prev => ({ ...prev, shiftId: defaultShift }));
            }

            setBookings(bookingsRes.data || []);
            setQrCode(qrRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Load data error:", error);
            toast.error("Failed to load library data");
            setLoading(false);
        }
    };

    const applySeatStatus = () => {
        const updated = rawSeats.map(seat => {
            if (seat.status !== 'AVAILABLE') return seat;

            const seatBookings = bookings.filter(b => b.seatId === seat.id &&
                ['CONFIRMED', 'PAYMENT_SUBMITTED'].includes(b.status));

            let newStatus = 'AVAILABLE';

            if (selectedShiftId) {
                const shiftBooking = seatBookings.find(b => b.shiftId === parseInt(selectedShiftId));
                if (shiftBooking) {
                    newStatus = shiftBooking.status === 'CONFIRMED' ? 'BOOKED' : 'HOLD';
                }
            }
            return { ...seat, status: newStatus };
        });
        setAllSeats(updated);
    };

    const { tables, teachers, stats } = useMemo(() => {
        const roomSeats = allSeats.filter(s => s.section === room);
        const studentSeats = roomSeats.filter(s => !s.seatNumber?.includes('T'));
        const teacherSeats = roomSeats.filter(s => s.seatNumber?.includes('T'));

        const sortedStudents = [...studentSeats].sort((a, b) => {
            const parse = (sn) => {
                const m = sn?.match(/[A-E](\d+)-(\d+)/);
                return m ? [parseInt(m[1]), parseInt(m[2])] : [999, 999];
            };
            const [t1, c1] = parse(a.seatNumber);
            const [t2, c2] = parse(b.seatNumber);
            return t1 !== t2 ? t1 - t2 : c1 - c2;
        });

        const tablesData = [];
        for (let t = 1; t <= TABLES_COUNT; t++) {
            const tableChairs = sortedStudents.filter(s => {
                const m = s.seatNumber?.match(/[A-E](\d+)-/);
                return m && parseInt(m[1]) === t;
            }).slice(0, CHAIRS_PER_TABLE);
            while (tableChairs.length < CHAIRS_PER_TABLE) tableChairs.push(null);
            tablesData.push(tableChairs);
        }

        const sortedTeachers = [...teacherSeats].sort((a, b) => {
            const n = sn => { const m = sn?.match(/T(\d+)/); return m ? parseInt(m[1]) : 999; };
            return n(a.seatNumber) - n(b.seatNumber);
        });

        const teacherData = [];
        for (let i = 0; i < TEACHER_SEATS_COUNT; i++) teacherData.push(sortedTeachers[i] || null);

        const available = roomSeats.filter(s => s.status === 'AVAILABLE').length;
        return { tables: tablesData, teachers: teacherData, stats: { total: roomSeats.length, available } };
    }, [allSeats, room]);

    const handleSeatClick = (seat) => {
        if (seat?.status === 'AVAILABLE') {
            setSelected(seat);
            // Update form with currently selected shift
            setForm(prev => ({ ...prev, shiftId: selectedShiftId || prev.shiftId }));
            setModal(true);
        }
    };

    const handleBook = async () => {
        if (!form.shiftId) return toast.error("Please select a shift");
        if (!paymentScreenshot) return toast.error("Please upload payment screenshot");

        try {
            const s = shifts.find(x => x.id === parseInt(form.shiftId));
            const user = authService.getCurrentUser();
            await bookingService.createBooking({
                userId: user.userId,
                seatId: selected.id,
                shiftId: parseInt(form.shiftId),
                bookingDate: form.startDate,
                startDate: form.startDate,
                endDate: new Date(new Date(form.startDate).setMonth(new Date(form.startDate).getMonth() + 1)).toISOString().split('T')[0],
                duration: form.duration,
                totalAmount: s?.basePrice || 0,
                status: 'PAYMENT_SUBMITTED',
                paymentScreenshot: paymentScreenshot
            });
            setBookingSuccess(true);
            setTimeout(() => {
                setModal(false);
                setBookingSuccess(false);
                setPaymentScreenshot('');
                loadData();
                toast.success("Payment submitted! Awaiting admin verification.");
            }, 1500);
        } catch { toast.error("Booking failed"); }
    };
    const getPrice = () => { const s = shifts.find(x => x.id === parseInt(form.shiftId)); return s ? s.basePrice : 0; };

    const currentTheme = ROOM_THEMES[room];

    if (loading) return <div className="loading-screen">Loading Library...</div>;

    return (
        <div className={`seat-booking-container ${currentTheme.id} ${isDarkMode ? 'dark' : 'light'}`}>
            <header className="page-header">
                <button onClick={() => navigate('/dashboard')} className="back-btn">← Dashboard</button>
                <div className="header-info">
                    <h1>{currentTheme.icon} {currentTheme.name}</h1>
                    <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Check Availability:</span>
                        <select
                            value={selectedShiftId}
                            onChange={(e) => setSelectedShiftId(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.2)',
                                color: 'var(--theme-text)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            {shifts.map(s => (
                                <option key={s.id} value={s.id} style={{ color: '#333' }}>
                                    {s.name} ({s.startTime?.slice(0, 5)} - {s.endTime?.slice(0, 5)})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={toggleTheme} className="theme-toggle">{isDarkMode ? '☀' : '🌙'}</button>
            </header>

            <div className="room-selector">
                {['A', 'B', 'C', 'D', 'E'].map(r => (
                    <button key={r} onClick={() => setRoom(r)} className={`room-tab ${room === r ? 'active' : ''}`}>
                        {ROOM_THEMES[r].icon} Room {r}
                    </button>
                ))}
            </div>

            {/* Seat Status Legend */}
            <div className="status-legend">
                <div className="legend-item">
                    <div className="legend-dot available"></div>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot booked"></div>
                    <span>Booked</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot hold"></div>
                    <span>On Hold</span>
                </div>
                <div className="room-capacity">
                    🪑 {stats.available} / {stats.total} seats available
                </div>
            </div>

            <div className="library-room-layout">
                {/* Teacher Row Top */}
                <div className="teacher-row top">
                    {teachers.slice(0, 4).map((t, i) => (
                        <div key={i} className="teacher-unit">
                            <div className={`teacher-chair ${t ? t.status.toLowerCase() : ''}`}></div>
                            <div className={`teacher-desk ${t ? t.status.toLowerCase() : ''}`}
                                onClick={() => handleSeatClick(t)} title={t?.seatNumber}>
                                <span className="teacher-label">{t?.seatNumber || 'Instructor'}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Tables Grid */}
                <div className="library-grid">
                    {tables.slice(0, 8).map((tableChairs, idx) => (
                        <div key={idx} className="library-table-unit">
                            {/* Top Chairs */}
                            <div className="chairs-row top">
                                {tableChairs.slice(0, 3).map((seat, cIdx) => (
                                    <div key={cIdx} className={`library-chair ${seat ? seat.status.toLowerCase() : 'empty'}`}
                                        onClick={() => handleSeatClick(seat)} title={seat?.seatNumber}>
                                    </div>
                                ))}
                            </div>

                            {/* Table Surface with Emojis */}
                            <div className="table-surface">
                                <div className="decor-left">{currentTheme.decor[0]}</div>
                                <span className="table-label">Table {idx + 1}</span>
                                <div className="decor-right">{currentTheme.decor[1]}</div>
                            </div>

                            {/* Bottom Chairs */}
                            <div className="chairs-row bottom">
                                {tableChairs.slice(3, 6).map((seat, cIdx) => (
                                    <div key={cIdx} className={`library-chair ${seat ? seat.status.toLowerCase() : 'empty'}`}
                                        onClick={() => handleSeatClick(seat)} title={seat?.seatNumber}>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Teacher Row Bottom */}
                <div className="teacher-row bottom">
                    {teachers.slice(4, 8).map((t, i) => (
                        <div key={i} className="teacher-unit bottom">
                            <div className={`teacher-desk ${t ? t.status.toLowerCase() : ''}`}
                                onClick={() => handleSeatClick(t)} title={t?.seatNumber}>
                                <span className="teacher-label">{t?.seatNumber || 'Instructor'}</span>
                            </div>
                            <div className={`teacher-chair ${t ? t.status.toLowerCase() : ''}`}></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {modal && selected && (
                <div className="modal-backdrop" onClick={() => setModal(false)}>
                    <div className="booking-modal payment-modal" onClick={e => e.stopPropagation()}>
                        {bookingSuccess ? <div className="success-message"><h2>✅ Payment Submitted!</h2><p>Awaiting verification...</p></div> : (
                            <>
                                <h2>Book {selected.seatNumber}</h2>
                                <select value={form.shiftId} onChange={e => setForm({ ...form, shiftId: e.target.value })}>
                                    <option value="">Select Shift</option>
                                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name} - ₹{s.basePrice}</option>)}
                                </select>

                                {form.shiftId && (
                                    <div className="payment-section">
                                        <h3>💳 Payment Details</h3>
                                        <p className="payment-amount">Amount: <strong>₹{getPrice()}</strong></p>

                                        {qrCode ? (
                                            <>
                                                <div className="qr-display">
                                                    <img src={qrCode.imageUrl} alt="UPI QR Code" />
                                                    <p className="qr-instruction">Scan this QR code to pay via UPI</p>
                                                    {qrCode.upiId && (
                                                        <div className="upi-id-box">
                                                            <p className="upi-label">UPI ID:</p>
                                                            <p className="upi-value">{qrCode.upiId}</p>
                                                            <button
                                                                className="copy-upi-btn"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(qrCode.upiId);
                                                                    toast.success('UPI ID copied!');
                                                                }}
                                                            >
                                                                📋 Copy
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="screenshot-upload">
                                                    <label htmlFor="payment-screenshot">
                                                        <strong>Upload Payment Screenshot</strong>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id="payment-screenshot"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                if (file.size > 5 * 1024 * 1024) {
                                                                    toast.error('Image size should be less than 5MB');
                                                                    return;
                                                                }
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => setPaymentScreenshot(reader.result);
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <label htmlFor="payment-screenshot" className="upload-btn">
                                                        {paymentScreenshot ? '✅ Screenshot Uploaded' : '📸 Choose Screenshot'}
                                                    </label>
                                                    {paymentScreenshot && (
                                                        <img src={paymentScreenshot} alt="Payment Screenshot" className="screenshot-preview" />
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="no-qr-warning">
                                                <p>⚠️ Payment QR code not available. Please contact admin.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button onClick={() => { setModal(false); setPaymentScreenshot(''); }}>Cancel</button>
                                    <button
                                        onClick={handleBook}
                                        className="primary"
                                        disabled={!form.shiftId || !paymentScreenshot}
                                    >
                                        Submit Booking
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .payment-modal {
                    max-width: 600px !important;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .payment-section {
                    margin: 1.5rem 0;
                    padding: 1.5rem;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                }

                .payment-section h3 {
                    margin: 0 0 1rem 0;
                    color: #4ECDC4;
                }

                .payment-amount {
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                }

                .qr-display {
                    text-align: center;
                    margin: 1.5rem 0;
                    padding: 1rem;
                    background: white;
                    border-radius: 12px;
                }

                .qr-display img {
                    max-width: 250px;
                    max-height: 250px;
                    border-radius: 8px;
                }

                .qr-instruction {
                    margin-top: 0.5rem;
                    font-size: 0.9rem;
                    color: #333;
                }

                .upi-id-box {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: rgba(78, 205, 196, 0.1);
                    border: 2px solid rgba(78, 205, 196, 0.3);
                    border-radius: 8px;
                }

                .upi-label {
                    font-size: 0.85rem;
                    color: #666;
                    margin: 0;
                }

                .upi-value {
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: #4ECDC4;
                    margin: 0.5rem 0;
                    word-break: break-all;
                }

                .copy-upi-btn {
                    padding: 0.4rem 0.8rem;
                    background: #4ECDC4;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                }

                .copy-upi-btn:hover {
                    background: #45b8b0;
                    transform: scale(1.05);
                }

                .screenshot-upload {
                    margin-top: 1.5rem;
                }

                .screenshot-upload label {
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .upload-btn {
                    display: block;
                    width: 100%;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: center;
                    transition: transform 0.2s;
                }

                .upload-btn:hover {
                    transform: scale(1.02);
                }

                .screenshot-preview {
                    margin-top: 1rem;
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    display: block;
                }

                .no-qr-warning {
                    text-align: center;
                    padding: 2rem;
                    color: #FF6B6B;
                }

                .modal-actions button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
