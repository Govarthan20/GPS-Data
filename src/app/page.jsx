"use client";

import React, { useState, useCallback } from 'react';
import Header from '../components/Header';
import StatusCards from '../components/StatusCards';
import dynamic from 'next/dynamic';

const GPSMap = dynamic(() => import('../components/GPSMap'), {
    ssr: false,
    loading: () => <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#0c1a3a' }}>Loading Fleet Map...</div>
});
import VehicleList from '../components/VehicleList';
import WaitTimePanel from '../components/WaitTimePanel';
import { useVehicles, useGPSLocations, useAssignments } from '../hooks/useSupabaseData';
import { useDeviceLocation } from '../hooks/useDeviceLocation';

import MobileNav from '../components/MobileNav';

export default function Home() {
    const { vehicles, loading: vehiclesLoading, refetch: refetchVehicles } = useVehicles();
    const { positions, loading: gpsLoading, refetch: refetchPositions } = useGPSLocations();
    const { assignments, loading: assignmentsLoading, refetch: refetchAssignments } = useAssignments();
    const { location: deviceLocation, error: gpsError } = useDeviceLocation();

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isLoading = vehiclesLoading || gpsLoading || assignmentsLoading;

    const handleRefresh = useCallback(() => {
        refetchVehicles();
        refetchPositions();
        refetchAssignments();
    }, [refetchVehicles, refetchPositions, refetchAssignments]);

    const handleSelectVehicle = useCallback((vehicleId) => {
        setSelectedVehicle(prev => prev === vehicleId ? null : vehicleId);
    }, []);

    // Helper to determine visibility on mobile
    const getTabClass = (tabId) => {
        return activeTab === tabId ? 'mobile-view' : 'mobile-hide';
    };

    return (
        <div className="app dashboard" id="app-root">
            <Header onRefresh={handleRefresh} isLoading={isLoading} />

            <section className={`dashboard-section ${getTabClass('dashboard')}`} style={{ padding: '0 32px' }}>
                <StatusCards vehicles={vehicles} />
            </section>

            <main className="dashboard-content">
                <div className={`content-main ${getTabClass('map')}`}>
                    <div className="map-container">
                        <GPSMap
                            positions={positions}
                            selectedVehicle={selectedVehicle}
                            onSelectVehicle={(id) => setSelectedVehicle(id)}
                            deviceLocation={deviceLocation}
                        />
                    </div>
                </div>

                <aside className="content-sidebar">
                    <div className={getTabClass('wait')}>
                        <WaitTimePanel assignments={assignments} vehicles={vehicles} />
                    </div>
                    <div className={getTabClass('vehicles')}>
                        <VehicleList
                            vehicles={vehicles}
                            positions={positions}
                            selectedVehicle={selectedVehicle}
                            onSelectVehicle={handleSelectVehicle}
                        />
                    </div>
                </aside>
            </main>

            <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

            {gpsError && (
                <div style={{
                    position: 'fixed',
                    bottom: activeTab === 'dashboard' ? '24px' : '88px', // Adjust for mobile nav
                    left: '24px',
                    background: '#dc2626',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fadeInUp 0.5s ease forwards'
                }}>
                    <span>⚠️ {gpsError}</span>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
