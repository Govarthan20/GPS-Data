import React from 'react';
import { Car, Truck, AlertTriangle, WifiOff } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '../utils/helpers';

const STATUS_CONFIG = [
    { key: 'available', icon: Car, label: 'Available' },
    { key: 'in_use', icon: Truck, label: 'In Use' },
    { key: 'maintenance', icon: AlertTriangle, label: 'Maintenance' },
    { key: 'offline', icon: WifiOff, label: 'Offline' },
];

export default function StatusCards({ vehicles }) {
    const counts = vehicles.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="status-cards">
            {STATUS_CONFIG.map(({ key, icon: Icon, label }) => {
                const count = counts[key] || 0;
                const color = getStatusColor(key);
                return (
                    <div
                        className="status-card"
                        key={key}
                        style={{ '--status-color': color }}
                    >
                        <div className="status-card-icon" style={{ background: `${color}20` }}>
                            <Icon size={24} color={color} />
                        </div>
                        <div className="status-card-info">
                            <span className="status-card-count">{count}</span>
                            <span className="status-card-label">{label}</span>
                        </div>
                        <div className="status-card-bar" style={{ background: color }} />
                    </div>
                );
            })}
        </div>
    );
}
