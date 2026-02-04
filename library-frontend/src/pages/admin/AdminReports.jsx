import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminReports() {
    const navigate = useNavigate();
    return (
        <div className="dashboard-content">
            <div className="page-header">
                <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
                <h1>📊 Reports & Analytics</h1>
            </div>
            <div className="glass-card">
                <h3>Monthly Revenue</h3>
                <div style={{ height: '200px', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Running Charts...
                </div>
                <div className="stats-grid" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <div className="stat-box">Total Revenue: ₹15,000</div>
                    <div className="stat-box">Occupancy: 85%</div>
                </div>
            </div>
        </div>
    );
}
