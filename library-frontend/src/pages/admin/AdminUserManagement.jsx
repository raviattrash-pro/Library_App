import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminUserManagement() {
    const navigate = useNavigate();
    return (
        <div className="dashboard-content">
            <div className="page-header">
                <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
                <h1>👥 User Management</h1>
            </div>
            <div className="glass-card">
                <table className="admin-table" style={{ width: '100%', textAlign: 'left' }}>
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>1</td><td>John Doe</td><td>STUDENT</td><td>Active</td><td><button>View</button></td></tr>
                        <tr><td>2</td><td>Admin User</td><td>ADMIN</td><td>Active</td><td><button>View</button></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
