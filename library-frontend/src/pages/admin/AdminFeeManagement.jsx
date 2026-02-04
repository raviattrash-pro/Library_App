import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminFeeManagement() {
    const navigate = useNavigate();
    return (
        <div className="dashboard-content">
            <div className="page-header">
                <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
                <h1>💰 Fee Configuration</h1>
            </div>
            <div className="glass-card">
                <h3>Shift Pricing</h3>
                <div className="form-group">
                    <label>Morning Shift (₹)</label>
                    <input type="number" defaultValue="500" />
                </div>
                <div className="form-group">
                    <label>Afternoon Shift (₹)</label>
                    <input type="number" defaultValue="600" />
                </div>
                <button className="btn btn-primary">Save Changes</button>
            </div>
        </div>
    );
}
