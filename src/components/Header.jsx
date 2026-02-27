import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Header({ onRefresh, isLoading }) {
    return (
        <header className="dashboard-header" id="dashboard-header">
            <div className="header-left">
                <div className="header-logo">
                    <img
                        src="/Vedanta_logo_tagline_transparent.png"
                        alt="Vedanta"
                        className="vedanta-logo-img"
                    />
                    <div className="logo-divider" />
                    <div className="logo-text">
                        <h1>FleetPulse</h1>
                        <span className="logo-subtitle">GPS Vehicle Tracking</span>
                    </div>
                </div>
            </div>
            <div className="header-right">
                <div className="header-live-indicator">
                    <span className="live-dot" />
                    <span>Live</span>
                </div>
                <button
                    className="header-refresh-btn"
                    onClick={onRefresh}
                    disabled={isLoading}
                    title="Refresh data"
                    id="refresh-btn"
                >
                    <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                </button>
            </div>
        </header>
    );
}
