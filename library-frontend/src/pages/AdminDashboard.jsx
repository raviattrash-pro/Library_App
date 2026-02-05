import React from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceHealthMonitor from '../components/ServiceHealthMonitor';
import './Dashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <nav className="navbar glass-card">
                <div className="nav-brand">
                    <h2>Admin Dashboard</h2>
                </div>
                <div className="nav-menu">
                    <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className="nav-link" onClick={() => navigate('/admin')}>Admin</button>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-section glass-card">
                    <h1>⚙️ Admin Control Panel</h1>
                    <p>Manage seats, fees, users, and bookings</p>
                    <ServiceHealthMonitor />
                </div>

                <div className="quick-actions">
                    <div className="action-card glass-card">
                        <span className="action-icon">🪑</span>
                        <h3>Seat Management</h3>
                        <p>Add, edit, or remove library seats</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/seats')}>Manage Seats</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">💰</span>
                        <h3>Fee Configuration</h3>
                        <p>Set shift prices and fee structures</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/fees')}>Configure Fees</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">👥</span>
                        <h3>User Management</h3>
                        <p>View and manage registered users</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/users')}>Manage Users</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">📊</span>
                        <h3>Reports & Analytics</h3>
                        <p>View revenue and occupancy reports</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/reports')}>View Reports</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">📅</span>
                        <h3>Booking Management</h3>
                        <p>View and approve all bookings</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/bookings')}>View Bookings</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">💳</span>
                        <h3>UPI QR Management</h3>
                        <p>Upload and manage payment QR code</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/qr-management')}>Manage QR</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">🔐</span>
                        <h3>Locker Verifications</h3>
                        <p>Approve/Reject Locker Bookings</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/lockers')}>Go to Lockers</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">☕</span>
                        <h3>Order Management</h3>
                        <p>Verify orders & update statuses</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/orders')}>Manage Orders</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">📜</span>
                        <h3>Menu Management</h3>
                        <p>Add/Edit snacks and stationery</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/menu')}>Update Menu</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">🛠️</span>
                        <h3>Maintenance Requests</h3>
                        <p>Track and resolve reported issues</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/maintenance')}>View Issues</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">🔍</span>
                        <h3>Lost & Found Admin</h3>
                        <p>Manage found items and claims</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/lost-found')}>Manage Items</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">🖨️</span>
                        <h3>Print Queue</h3>
                        <p>Verify payments and print docs</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/print')}>Print Jobs</button>
                    </div>

                    <div className="action-card glass-card">
                        <span className="action-icon">💰</span>
                        <h3>Profit & Loss</h3>
                        <p>Track Income vs Expenses</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/admin/finance')}>View Dashboard</button>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default AdminDashboard;
