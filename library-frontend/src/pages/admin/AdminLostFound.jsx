import React, { useState, useEffect } from 'react';
import lostFoundService from '../../services/lostFoundService';
import config from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUpload, FaCheck, FaEye, FaTrash } from 'react-icons/fa';
import './AdminPages.css';

const AdminLostFound = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ title: '', description: '', location: '', dateFound: new Date().toISOString().split('T')[0] });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await lostFoundService.getAllItems();
            setItems(data);
        } catch (error) {
            console.error("Error loading items:", error);
            toast.error("Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await lostFoundService.addItem(newItem.title, newItem.description, newItem.location, newItem.dateFound, image);
            toast.success("Found item reported successfully!");
            setNewItem({ title: '', description: '', location: '', dateFound: new Date().toISOString().split('T')[0] });
            setImage(null);
            document.getElementById('foundItemImage').value = '';
            loadItems();
        } catch (error) {
            console.error("Error adding item:", error);
            toast.error("Failed to add item");
        }
    };

    const handleClaim = async (id) => {
        if (window.confirm("Mark this item as claimed?")) {
            try {
                await lostFoundService.markClaimed(id);
                toast.success("Item marked as claimed");
                loadItems();
            } catch (error) {
                console.error("Error marking claimed:", error);
                toast.error("Failed to mark claimed");
            }
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${config.API_BASE_URL}${path}`;
    };

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

    const inputStyle = {
        width: '100%',
        padding: '12px 15px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.95rem',
        marginBottom: '10px',
        transition: 'border-color 0.3s',
        outline: 'none',
    };

    const btnPrimary = {
        backgroundColor: '#6366f1',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
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
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', background: 'linear-gradient(90deg, #fff, #a5a5a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Lost & Found Admin
                    </h1>
                </div>
                <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem' }}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div style={cardStyle}>
                        <h3 style={{ marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaUpload color="#6366f1" /> Report Found Item
                        </h3>
                        <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>What was found?</label>
                                <input
                                    style={inputStyle}
                                    placeholder="e.g. Blue Water Bottle"
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Location</label>
                                    <div style={{ position: 'relative' }}>
                                        <FaMapMarkerAlt style={{ position: 'absolute', top: '15px', left: '12px', color: '#666' }} />
                                        <input
                                            style={{ ...inputStyle, paddingLeft: '35px' }}
                                            placeholder="e.g. A1-1"
                                            value={newItem.location}
                                            onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Date Found</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="date"
                                            style={{ ...inputStyle }}
                                            value={newItem.dateFound}
                                            onChange={e => setNewItem({ ...newItem, dateFound: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Photo Evidence</label>
                                <input
                                    id="foundItemImage"
                                    type="file"
                                    style={{ ...inputStyle, padding: '10px' }}
                                    onChange={e => setImage(e.target.files[0])}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Description</label>
                                <textarea
                                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                                    placeholder="Additional details..."
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                />
                            </div>

                            <button type="submit" style={btnPrimary}>
                                Submit Report
                            </button>
                        </form>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaSearch color="#6366f1" /> Item History
                            </h3>
                            <button onClick={loadItems} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>
                                🔄 Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Loading records...</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                            <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>Date</th>
                                            <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>Item</th>
                                            <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>Location</th>
                                            <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>Status</th>
                                            <th style={{ padding: '15px', color: '#888', fontWeight: '500' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: item.status === 'Claimed' ? 0.5 : 1 }}>
                                                <td style={{ padding: '15px' }}>{new Date(item.dateFound).toLocaleDateString()}</td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ fontWeight: '600', color: '#fff' }}>{item.title}</div>
                                                    {item.imageUrl && (
                                                        <button
                                                            onClick={() => setSelectedImage(getImageUrl(item.imageUrl))}
                                                            style={{ fontSize: '0.8rem', color: '#6366f1', background: 'none', border: 'none', padding: 0, marginTop: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <FaEye /> View Image
                                                        </button>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px' }}>{item.foundLocation}</td>
                                                <td style={{ padding: '15px' }}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        backgroundColor: item.status === 'Found' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                                        color: item.status === 'Found' ? '#4ade80' : '#94a3b8',
                                                        border: `1px solid ${item.status === 'Found' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`
                                                    }}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    {item.status === 'Found' && (
                                                        <button
                                                            onClick={() => handleClaim(item.id)}
                                                            style={{
                                                                backgroundColor: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '6px 12px',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px'
                                                            }}
                                                        >
                                                            <FaCheck /> Claimed
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {items.length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                                    No lost items available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

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
                            backdropFilter: 'blur(10px)'
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
                                alt="Evidence"
                                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                style={{
                                    position: 'absolute', top: -40, right: 0,
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

export default AdminLostFound;
