import React, { useState, useEffect } from 'react';
import orderingService from '../../services/orderingService';
import authService from '../../services/authService';
import qrService from '../../services/qrService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './OrderTheme.css';

const OrderingPage = () => {
    const [user, setUser] = useState(null);
    const [menu, setMenu] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [cart, setCart] = useState({});
    const [isCheckout, setIsCheckout] = useState(false);
    const [viewOrders, setViewOrders] = useState(false);
    const [seatNumber, setSeatNumber] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [qrCode, setQrCode] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        loadMenu();
        fetchQrCode();
    }, []);

    useEffect(() => {
        if (viewOrders && user) {
            loadMyOrders();
        }
    }, [viewOrders, user]);

    const fetchQrCode = async () => {
        try {
            const res = await qrService.getQRCode();
            setQrCode(res.data);
        } catch (error) {
            console.error("Failed to load QR Code");
        }
    };

    const loadMenu = async () => {
        try {
            const data = await orderingService.getAvailableMenu();
            setMenu(data);
        } catch (error) {
            console.error("Error loading menu:", error);
            toast.error("Failed to load menu");
        }
    };

    const loadMyOrders = async () => {
        try {
            const data = await orderingService.getOrdersByUser(user.userId);
            // Sort by most recent
            data.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
            setMyOrders(data);
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    };

    const categories = ['All', 'Snack', 'Beverage', 'Meal', 'Stationery'];
    const filteredMenu = activeTab === 'All' ? menu : menu.filter(item => item.type === activeTab);

    const addToCart = (item) => {
        setCart(prev => ({
            ...prev,
            [item.id]: { item, qty: (prev[item.id]?.qty || 0) + 1 }
        }));
    };

    const removeFromCart = (itemId) => {
        setCart(prev => {
            const currentQty = prev[itemId]?.qty || 0;
            if (currentQty <= 1) {
                const newCart = { ...prev };
                delete newCart[itemId];
                return newCart;
            }
            return { ...prev, [itemId]: { ...prev[itemId], qty: currentQty - 1 } };
        });
    };

    const calculateTotal = () => Object.values(cart).reduce((sum, { item, qty }) => sum + (item.price * qty), 0);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!seatNumber || !screenshot) {
            toast.warning("Please provide seat number and payment screenshot.");
            return;
        }

        const items = Object.values(cart).map(({ item, qty }) => ({
            itemId: item.id,
            name: item.name,
            quantity: qty,
            price: item.price
        }));

        try {
            await orderingService.placeOrder(user.userId, user.username, user.email, user.phone, seatNumber, items, calculateTotal(), screenshot);
            toast.success("Order placed successfully! Waiting for verification.");
            setCart({});
            setIsCheckout(false);
            setSeatNumber('');
            setScreenshot(null);
            setViewOrders(true); // Switch to orders view
        } catch (error) {
            console.error("Order failed:", error);
            toast.error("Failed to place order.");
        }
    };

    // Sub-component for My Orders
    const MyOrdersView = () => (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.8em', color: '#e2e8f0' }}>📦 My Orders</h2>
                <button
                    onClick={() => setViewOrders(false)}
                    className="btn-primary"
                    style={{ padding: '8px 16px' }}
                >
                    + New Order
                </button>
            </div>

            {myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <p>No orders found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {myOrders.map(order => {
                        let items = [];
                        try { items = JSON.parse(order.itemsJson); } catch (e) { }

                        return (
                            <div key={order.id} className="glass-panel" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9em', color: '#94a3b8' }}>
                                            {new Date(order.orderTime).toLocaleDateString()} • {new Date(order.orderTime).toLocaleTimeString()}
                                        </div>
                                        <div style={{ marginTop: '5px' }}>Seat: <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>{order.seatNumber}</span></div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.9em',
                                            background: order.status === 'Verified' ? 'rgba(34, 197, 94, 0.2)' : order.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                            color: order.status === 'Verified' ? '#4ade80' : order.status === 'Pending' ? '#facc15' : '#94a3b8'
                                        }}>
                                            {order.status}
                                        </div>
                                        <div style={{ marginTop: '5px', fontWeight: 'bold', color: '#818cf8' }}>₹{order.totalAmount}</div>
                                    </div>
                                </div>

                                <div>
                                    {items.map((i, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95em', marginBottom: '4px', color: '#cbd5e1' }}>
                                            <span>{i.name} <span style={{ opacity: 0.6 }}>x{i.quantity}</span></span>
                                            <span>₹{i.price * i.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (isCheckout) {
        return (
            <div className="container" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
                <button onClick={() => setIsCheckout(false)} className="btn-secondary" style={{ marginBottom: '20px', background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}>
                    ← Back to Menu
                </button>

                <div className="glass-panel animate-fade-in" style={{ padding: '40px' }}>
                    <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', marginBottom: '30px' }}>
                        🛍️ Checkout
                    </h2>

                    <div style={{ marginBottom: '30px' }}>
                        {Object.values(cart).map(({ item, qty }) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                        {item.imageUrl && <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <span style={{ color: '#e2e8f0' }}>{item.name} <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>x{qty}</span></span>
                                </div>
                                <span style={{ fontWeight: '600', color: '#818cf8' }}>₹{item.price * qty}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '1.2em', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span style={{ color: '#4ade80' }}>₹{calculateTotal()}</span>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '20px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center', border: '1px dashed rgba(99, 102, 241, 0.3)' }}>
                        <h4 style={{ marginBottom: '15px', color: '#818cf8' }}>Scan to Pay</h4>
                        {qrCode && qrCode.imageUrl ? (
                            <img src={qrCode.imageUrl} alt="UPI QR" style={{ width: '150px', borderRadius: '10px', padding: '5px', background: 'white' }} />
                        ) : (
                            <div style={{ padding: '20px' }}>Loading QR...</div>
                        )}
                        <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#94a3b8' }}>
                            UPI ID: <strong>{qrCode ? qrCode.upiId : 'Loading...'}</strong>
                        </p>
                    </div>

                    <form onSubmit={handlePlaceOrder}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Seat Number</label>
                            <input
                                className="glass-input"
                                value={seatNumber}
                                onChange={(e) => setSeatNumber(e.target.value)}
                                placeholder="e.g. A-12"
                            />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Payment Screenshot</label>
                            <div style={{ padding: '20px', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                                <input
                                    type="file"
                                    onChange={(e) => setScreenshot(e.target.files[0])}
                                    accept="image/*"
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                                <span style={{ color: '#94a3b8' }}>
                                    {screenshot ? `📄 ${screenshot.name}` : 'Click to upload screenshot'}
                                </span>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1em' }}>
                            Confirm Order
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        padding: '8px 16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#94a3b8',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    ← Back to Home
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setViewOrders(!viewOrders)}
                        className={`btn-secondary ${viewOrders ? 'active' : ''}`}
                        style={{ background: viewOrders ? 'rgba(129, 140, 248, 0.2)' : 'transparent', color: viewOrders ? 'white' : '#94a3b8' }}
                    >
                        {viewOrders ? '🍔 Menu' : '📋 My Orders'}
                    </button>
                </div>
            </div>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5em', marginBottom: '10px', background: 'linear-gradient(to right, #818cf8, #e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Canteen & Store
                    </h1>
                    <p style={{ color: '#94a3b8' }}>Fuel your study session 🚀</p>
                </div>

                {!viewOrders && (
                    <div
                        onClick={() => Object.keys(cart).length > 0 && setIsCheckout(true)}
                        style={{
                            position: 'relative',
                            cursor: Object.keys(cart).length > 0 ? 'pointer' : 'default',
                            opacity: Object.keys(cart).length > 0 ? 1 : 0.5
                        }}
                    >
                        <div style={{ fontSize: '2em' }}>🛒</div>
                        {Object.keys(cart).length > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-10px',
                                background: '#ef4444', color: 'white',
                                borderRadius: '50%', width: '24px', height: '24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8em', fontWeight: 'bold'
                            }}>
                                {Object.values(cart).reduce((a, b) => a + b.qty, 0)}
                            </span>
                        )}
                    </div>
                )}
            </header>

            {viewOrders ? <MyOrdersView /> : (
                <>
                    {/* Category Filter */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '20px',
                                    border: '1px solid',
                                    borderColor: activeTab === cat ? '#818cf8' : 'rgba(255,255,255,0.1)',
                                    background: activeTab === cat ? 'rgba(129, 140, 248, 0.2)' : 'transparent',
                                    color: activeTab === cat ? 'white' : '#94a3b8',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Menu Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' }}>
                        {filteredMenu.map(item => (
                            <div key={item.id} className="glass-panel animate-fade-in" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '180px', position: 'relative', background: '#1e293b' }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3em' }}>🍔</div>
                                    )}
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', padding: '5px 10px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                                        <span style={{ fontSize: '0.8em', color: 'white' }}>{item.type}</span>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1.2em', margin: 0 }}>{item.name}</h3>
                                        <span style={{ fontWeight: 'bold', color: '#818cf8' }}>₹{item.price}</span>
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                                        {cart[item.id] ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px' }}>
                                                <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2em', cursor: 'pointer', padding: '0 15px' }}>-</button>
                                                <span style={{ fontWeight: '600' }}>{cart[item.id].qty}</span>
                                                <button onClick={() => addToCart(item)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2em', cursor: 'pointer', padding: '0 15px' }}>+</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => addToCart(item)} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredMenu.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            <p style={{ fontSize: '1.5em' }}>😕 No items found in this category</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrderingPage;
