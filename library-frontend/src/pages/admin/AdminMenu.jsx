import React, { useState, useEffect } from 'react';
import orderingService from '../../services/orderingService';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminPages.css';

const AdminMenu = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ name: '', type: 'Snack', price: '', imageUrl: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        loadMenu();
    }, []);

    const loadMenu = async () => {
        try {
            setLoading(true);
            const data = await orderingService.getAllMenu();
            setMenu(data);
        } catch (error) {
            console.error("Error loading menu:", error);
            toast.error("Failed to load menu items");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            if (!newItem.name || !newItem.price) {
                toast.warning("Name and Price are required");
                return;
            }

            if (isEditing) {
                await orderingService.updateMenuItem(editId, newItem);
                toast.success("Item updated successfully");
                setIsEditing(false);
                setEditId(null);
            } else {
                await orderingService.addMenuItem(newItem);
                toast.success("Item added successfully");
            }

            setNewItem({ name: '', type: 'Snack', price: '', imageUrl: '' });
            loadMenu();
        } catch (error) {
            console.error("Error saving item:", error);
            toast.error("Failed to save item");
        }
    };

    const handleEditClick = (item) => {
        setNewItem({
            name: item.name,
            type: item.type,
            price: item.price,
            imageUrl: item.imageUrl || ''
        });
        setIsEditing(true);
        setEditId(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setNewItem({ name: '', type: 'Snack', price: '', imageUrl: '' });
    };

    const toggleAvailability = async (id, currentStatus) => {
        try {
            await orderingService.updateItemAvailability(id, !currentStatus);
            toast.info(`Item marked as ${!currentStatus ? 'Available' : 'Unavailable'}`);
            loadMenu();
        } catch (error) {
            console.error("Error updating availability:", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await orderingService.deleteMenuItem(id);
            toast.success("Item deleted");
            if (editId === id) handleCancelEdit();
            loadMenu();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete item");
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <button className="back-btn" onClick={() => navigate('/admin')}>← Back</button>
                <h1>🍔 Menu Management</h1>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                {/* Left Column: Add/Edit Item Form */}
                <div className="glass-card">
                    <h3>{isEditing ? '✏️ Edit Item' : '➕ Add New Item'}</h3>
                    <form onSubmit={handleCreateOrUpdate} className="admin-form">
                        <div className="form-group">
                            <label>Item Name</label>
                            <input
                                className="glass-input"
                                placeholder="e.g. Cheese Sandwich"
                                value={newItem.name}
                                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className="glass-input"
                                value={newItem.type}
                                onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                            >
                                <option value="Snack">Snack</option>
                                <option value="Beverage">Beverage</option>
                                <option value="Stationery">Stationery</option>
                                <option value="Meal">Meal</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Price (₹)</label>
                            <input
                                type="number"
                                className="glass-input"
                                placeholder="0.00"
                                value={newItem.price}
                                onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Image URL (Optional)</label>
                            <input
                                className="glass-input"
                                placeholder="https://..."
                                value={newItem.imageUrl}
                                onChange={e => setNewItem({ ...newItem, imageUrl: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="primary-btn full-width">
                                {isEditing ? 'Update Item' : 'Add Item'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={handleCancelEdit} className="btn-secondary" style={{ width: 'auto' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right Column: Menu List */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>📜 Current Menu</h3>
                        <span className="badge">{menu.length} Items</span>
                    </div>

                    {loading ? <div className="spinner"></div> : (
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menu.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>No items found. Add one!</td></tr>
                                    ) : (
                                        menu.map(item => (
                                            <tr key={item.id} className={editId === item.id ? 'highlight-row' : ''}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍔'}
                                                        </div>
                                                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                                                    </div>
                                                </td>
                                                <td><span className={`role-badge ${item.type.toLowerCase()}`}>{item.type}</span></td>
                                                <td>₹{item.price}</td>
                                                <td>
                                                    <div
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                                        onClick={() => toggleAvailability(item.id, item.available)}
                                                        title="Click to toggle availability"
                                                    >
                                                        <span className={`status-dot ${item.available ? 'online' : 'offline'}`}></span>
                                                        {item.available ? 'Available' : 'Out of Stock'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="btn-sm"
                                                            style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none' }}
                                                            onClick={() => handleEditClick(item)}
                                                            title="Edit Item"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="btn-sm btn-danger"
                                                            style={{ backgroundColor: '#ef4444' }}
                                                            onClick={() => handleDelete(item.id)}
                                                            title="Delete Item"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMenu;
