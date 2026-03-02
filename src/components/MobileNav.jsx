"use client";

import React from 'react';
import { Map, Truck, Clock, LayoutDashboard } from 'lucide-react';

export default function MobileNav({ activeTab, setActiveTab }) {
    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'map', label: 'Live Map', icon: Map },
        { id: 'vehicles', label: 'Fleet', icon: Truck },
        { id: 'wait', label: 'Wait Times', icon: Clock },
    ];

    return (
        <nav className="mobile-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <Icon size={20} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
