import React from 'react';
import {
    getStatusColor,
    getStatusLabel,
    getVehicleIcon,
    formatSpeed,
    formatTime,
} from '../utils/helpers';
import { MapPin, Gauge, Fuel, Clock } from 'lucide-react';

export default function VehicleList({ vehicles, positions, selectedVehicle, onSelectVehicle }) {
    const getPositionForVehicle = (vehicleId) => {
        return positions.find(p => p.vehicle_id === vehicleId);
    };

    return (
        <div className="vehicle-list" id="vehicle-list">
            <div className="vehicle-list-header">
                <h3>Fleet Vehicles</h3>
                <span className="vehicle-count">{vehicles.length} total</span>
            </div>
            <div className="vehicle-list-body">
                {vehicles.map((vehicle) => {
                    const pos = getPositionForVehicle(vehicle.id);
                    const VehicleIcon = getVehicleIcon(vehicle.type);
                    const isSelected = selectedVehicle === vehicle.id;
                    const statusColor = getStatusColor(vehicle.status);

                    return (
                        <div key={vehicle.id} className="vehicle-wrapper">
                            <div
                                className={`vehicle-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => onSelectVehicle?.(vehicle.id)}
                                style={{ '--status-color': statusColor }}
                                id={`vehicle-item-${vehicle.id}`}
                            >
                                <div className="vehicle-item-left">
                                    <div className="vehicle-icon-wrap" style={{ background: `${statusColor}18` }}>
                                        <VehicleIcon size={20} color={statusColor} />
                                    </div>
                                    <div className="vehicle-info">
                                        <span className="vehicle-name">{vehicle.name}</span>
                                        <span className="vehicle-plate">{vehicle.plate_number}</span>
                                    </div>
                                </div>
                                <div className="vehicle-item-right">
                                    <span
                                        className="vehicle-status-badge"
                                        style={{ background: `${statusColor}18`, color: statusColor }}
                                    >
                                        {getStatusLabel(vehicle.status)}
                                    </span>
                                    <div className="vehicle-meta">
                                        {pos && (
                                            <>
                                                <span className="vehicle-meta-item" title="Speed">
                                                    <Gauge size={12} /> {formatSpeed(pos.speed)}
                                                </span>
                                                <span
                                                    className="vehicle-meta-item"
                                                    title="Last update"
                                                    suppressHydrationWarning
                                                >
                                                    <Clock size={12} /> {formatTime(pos.recorded_at)}
                                                </span>
                                            </>
                                        )}
                                        <span className="vehicle-meta-item" title="Fuel level">
                                            <Fuel size={12} /> {vehicle.fuel_level}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
