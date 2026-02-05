import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ServiceHealthMonitor.css';

const SERVICES = [
    { name: 'Auth Service', endpoint: '/api/v1/auth/health' },
    { name: 'Library Service', endpoint: '/api/v1/seats/health' },
    { name: 'Booking Service', endpoint: '/api/v1/bookings/health' }
];

const ServiceHealthMonitor = () => {
    const [statuses, setStatuses] = useState({});

    useEffect(() => {
        // Initial check
        SERVICES.forEach(service => checkService(service));

        // Poll every 30 seconds to keep them awake
        const interval = setInterval(() => {
            SERVICES.forEach(service => checkService(service));
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const checkService = async (service) => {
        setStatuses(prev => ({ ...prev, [service.name]: 'loading' }));
        try {
            await api.get(service.endpoint);
            setStatuses(prev => ({ ...prev, [service.name]: 'online' }));
        } catch (error) {
            // Even a 401/403 means the service is technically "awake" and reachable
            if (error.response) {
                setStatuses(prev => ({ ...prev, [service.name]: 'online' }));
            } else {
                setStatuses(prev => ({ ...prev, [service.name]: 'offline' }));
            }
        }
    };

    return (
        <div className="service-health-monitor glass-card">
            <h4>📡 Live Service Status</h4>
            <div className="status-grid">
                {SERVICES.map(service => (
                    <div key={service.name} className="status-item">
                        <span className={`status-indicator ${statuses[service.name] || 'loading'}`}></span>
                        <span className="service-name">{service.name}</span>
                        {statuses[service.name] === 'loading' && <span className="waking-up"> (Waking up...)</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceHealthMonitor;
