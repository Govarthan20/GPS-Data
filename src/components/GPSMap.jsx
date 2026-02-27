"use client";

import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStatusColor, getStatusLabel, formatSpeed, formatTime } from '../utils/helpers';

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
    const createCustomIcon = (status) => {
        const color = getStatusColor(status);
        return L.divIcon({
            className: 'custom-vehicle-marker',
            html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
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
                        icon={createCustomIcon(pos.vehicle_status)}
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
            </MapContainer>

            <div className="map-overlay-info">
                <span className="map-live-dot" />
                <span>Live Tracking • {positions.length} vehicles</span>
                {deviceLocation && <span style={{ marginLeft: '12px', color: '#00a650' }}>• GPS Active</span>}
            </div>
        </div>
    );
}
