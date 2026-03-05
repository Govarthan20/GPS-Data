"use client";

import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStatusColor, getStatusLabel, formatSpeed, formatTime } from '../utils/helpers';
import { matchPassengerToDriver } from '../utils/rideSharing';

// Fix for default Leaflet icons in Next.js environment
const fixLeafletIcons = () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
};

// Component to handle map centering and panning
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom(), {
                animate: true,
                duration: 1
            });
        }
    }, [center, map]);
    return null;
}

const defaultCenter = [19.0760, 72.8777]; // Mumbai coordinates

export default function GPSMap({ positions, selectedVehicle, onSelectVehicle, deviceLocation }) {
    useEffect(() => {
        fixLeafletIcons();
    }, []);

    const center = useMemo(() => {
        if (selectedVehicle === 'current-device' && deviceLocation) {
            return [deviceLocation.latitude, deviceLocation.longitude];
        }
        if (selectedVehicle) {
            const pos = positions.find(p => p.vehicle_id === selectedVehicle);
            if (pos) return [pos.latitude, pos.longitude];
        }
        if (positions.length > 0) {
            const avgLat = positions.reduce((s, p) => s + p.latitude, 0) / positions.length;
            const avgLng = positions.reduce((s, p) => s + p.longitude, 0) / positions.length;
            return [avgLat, avgLng];
        }
        if (deviceLocation) {
            return [deviceLocation.latitude, deviceLocation.longitude];
        }
        return defaultCenter;
    }, [positions, selectedVehicle, deviceLocation]);

    // Create custom colorful circle marker for vehicles
    const createCustomIcon = (status, heading, type) => {
        const color = getStatusColor(status);
        // An SVG that looks like a vehicle from the top down, pointing UP at 0 degrees
        const svg = `
        <svg fill="${color}" stroke="#ffffff" stroke-width="2" width="28" height="28" viewBox="0 0 24 24" style="transform: rotate(${heading || 0}deg);">
            <path d="M4.5,10 C4.5,8.5 5.5,7 8,7 L16,7 C18.5,7 19.5,8.5 19.5,10 L20.5,18 C20.5,19 19,20 18,20 L6,20 C5,20 3.5,19 3.5,18 L4.5,10 Z"></path>
            <path d="M7,11 L17,11 L16,14 L8,14 L7,11 Z" fill="#ffffff" stroke="none"></path>
        </svg>
        `;
        return L.divIcon({
            className: 'custom-vehicle-marker',
            html: `<div style="width: 28px; height: 28px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">${svg}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14]
        });
    };

    // Create pulse marker for user device
    const deviceIcon = L.divIcon({
        className: 'custom-device-icon',
        html: `
            <div class="device-marker">
                <div class="dot"></div>
                <div class="pulse"></div>
            </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });

    const bestMatch = useMemo(() => {
        if (!deviceLocation || positions.length === 0) return null;

        // Adapt positions for the algorithm
        const driversForAlgorithm = positions.map(p => ({
            ...p,
            lat: p.latitude,
            lon: p.longitude,
            capacity: 4, // Default capacity since we don't have it in the DB yet
            status: p.vehicle_status || 'available' // Treat as available if status is missing, but algorithms requires 'available'
        }));

        const passenger = {
            lat: deviceLocation.latitude,
            lon: deviceLocation.longitude,
            seatsRequired: 1
        };

        return matchPassengerToDriver(passenger, driversForAlgorithm, 50); // Search within 50km radius
    }, [deviceLocation, positions]);

    return (
        <div className="map-container" id="gps-map-container" style={{ height: '100%', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
            <MapContainer
                center={center}
                zoom={12}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <ChangeView center={center} />

                {/* TileLayer using CartoDB Dark Matter (Free, matches corporate navy theme) */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <ZoomControl position="bottomright" />

                {/* Device Location Marker */}
                {deviceLocation && (
                    <Marker
                        position={[deviceLocation.latitude, deviceLocation.longitude]}
                        icon={deviceIcon}
                        eventHandlers={{
                            click: () => onSelectVehicle?.('current-device'),
                        }}
                    >
                        <Popup>
                            <div className="popup-content">
                                <strong>Your Current Location</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Vehicle Markers */}
                {positions.map((pos) => (
                    <Marker
                        key={pos.vehicle_id}
                        position={[pos.latitude, pos.longitude]}
                        icon={createCustomIcon(pos.vehicle_status, pos.heading, pos.vehicle_type)}
                        eventHandlers={{
                            click: () => onSelectVehicle?.(pos.vehicle_id),
                        }}
                    >
                        <Popup>
                            <div className="popup-content">
                                <div className="popup-header">
                                    <strong>{pos.vehicle_name || 'Vehicle'}</strong>
                                    <span
                                        className="popup-status"
                                        style={{ background: getStatusColor(pos.vehicle_status), color: '#fff', padding: '2px 8px', borderRadius: '100px', fontSize: '10px' }}
                                    >
                                        {getStatusLabel(pos.vehicle_status)}
                                    </span>
                                </div>
                                <div className="popup-details">
                                    <div className="popup-row">
                                        <span className="popup-label">Plate:</span>
                                        <span>{pos.plate_number}</span>
                                    </div>
                                    <div className="popup-row">
                                        <span className="popup-label">Speed:</span>
                                        <span>{formatSpeed(pos.speed)}</span>
                                    </div>
                                    <div className="popup-row">
                                        <span className="popup-label">Updated:</span>
                                        <span>{formatTime(pos.recorded_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Best Match Polyline */}
                {deviceLocation && bestMatch && (
                    <Polyline
                        positions={[
                            [deviceLocation.latitude, deviceLocation.longitude],
                            [bestMatch.latitude, bestMatch.longitude]
                        ]}
                        color="#00a650"
                        dashArray="10, 10"
                        weight={3}
                        opacity={0.8}
                    >
                        <Popup>
                            <div className="popup-content">
                                <strong>Best Driver Assigned</strong>
                                <div className="popup-details" style={{ marginTop: '8px' }}>
                                    <div className="popup-row">
                                        <span className="popup-label">Vehicle:</span>
                                        <span>{bestMatch.vehicle_name || 'Vehicle'}</span>
                                    </div>
                                    <div className="popup-row">
                                        <span className="popup-label">Distance:</span>
                                        <span>{bestMatch.distanceToPassenger} km</span>
                                    </div>
                                    <div className="popup-row">
                                        <span className="popup-label">ETA:</span>
                                        <span>~{bestMatch.estimatedEtaMinutes} min</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Polyline>
                )}
            </MapContainer>

            <div className="map-overlay-info">
                <span className="map-live-dot" />
                <span>Live Tracking • {positions.length} vehicles</span>
                {deviceLocation && <span style={{ marginLeft: '12px', color: '#00a650' }}>• GPS Active</span>}
            </div>
        </div>
    );
}
