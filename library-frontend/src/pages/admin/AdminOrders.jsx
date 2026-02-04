import React, { useState, useEffect } from 'react';
import orderingService from '../../services/orderingService';
import config from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderingService.getAllOrders();
            // Sort by pending/recent
            data.sort((a, b) => {
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                return new Date(b.orderTime) - new Date(a.orderTime);
            });
            setOrders(data);
        } catch (error) {
            console.error("Error loading orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await orderingService.updateOrderStatus(id, status);
            toast.success(`Order marked as ${status}`);
            loadOrders();
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update status");
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // Direct to library-service for uploads to bypass potential gateway issues with static files
        if (path.startsWith('/uploads')) return `http://localhost:8082${path}`;
        return `${config.API_BASE_URL}${path}`;
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>📦 Order Management</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Recent Orders</h3>
                    <button onClick={loadOrders} className="btn-secondary" style={{ padding: '5px 10px' }}>🔄 Refresh</button>
                </div>

                {loading ? <div className="spinner"></div> : (
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>User</th>
                                    <th>Seat</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Proof</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => {
                                    let items = [];
                                    try { items = JSON.parse(order.itemsJson); } catch (e) { }

                                    return (
                                        <tr key={order.id}>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                                    {new Date(order.orderTime).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '500' }}>{order.userName}</div>
                                                <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{order.userEmail}</div>
                                                <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{order.userPhone}</div>
                                            </td>
                                            <td><span style={{ fontWeight: 'bold' }}>{order.seatNumber}</span></td>
                                            <td>
                                                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                                    {items.map((i, idx) => (
                                                        <div key={idx} style={{ fontSize: '0.9em', marginBottom: '2px' }}>
                                                            {i.name} <span style={{ opacity: 0.7 }}>x{i.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 'bold', color: '#4ade80' }}>₹{order.totalAmount}</td>
                                            <td>
                                                {order.paymentScreenshotUrl ? (
                                                    <button
                                                        onClick={() => setSelectedImage(getImageUrl(order.paymentScreenshotUrl))}
                                                        style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#60a5fa', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}
                                                    >
                                                        View
                                                    </button>
                                                ) : <span style={{ opacity: 0.5 }}>None</span>}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${order.status.toLowerCase()}`}
                                                    style={{
                                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em',
                                                        background: order.status === 'Verified' ? 'rgba(34, 197, 94, 0.2)' : order.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                                        color: order.status === 'Verified' ? '#4ade80' : order.status === 'Pending' ? '#facc15' : '#94a3b8'
                                                    }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {order.status === 'Pending' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(order.id, 'Verified')}
                                                            className="btn-sm"
                                                            style={{ backgroundColor: '#22c55e', color: 'white', border: 'none' }}
                                                            title="Verify Order"
                                                        >
                                                            ✅ Verify
                                                        </button>
                                                    )}
                                                    {order.status === 'Verified' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                                                            className="btn-sm"
                                                            style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }}
                                                            title="Mark as Delivered"
                                                        >
                                                            🚚 Deliver
                                                        </button>
                                                    )}
                                                    {order.status === 'Delivered' && (
                                                        <span style={{ fontSize: '1.2em' }}>🎉</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {orders.length === 0 && (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setSelectedImage(null)}>
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <img
                            src={selectedImage}
                            alt="Payment Proof"
                            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            style={{
                                position: 'absolute', top: '-10px', right: '-10px',
                                background: '#ef4444', color: 'white', border: 'none',
                                borderRadius: '50%', width: '30px', height: '30px',
                                cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
