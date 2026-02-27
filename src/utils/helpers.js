import { Car, Truck, Bus, Bike } from 'lucide-react';

export function getStatusColor(status) {
    switch (status) {
        case 'available': return '#00a650';
        case 'in_use': return '#2563eb';
        case 'maintenance': return '#e6a817';
        case 'offline': return '#dc2626';
        default: return '#6b7280';
    }
}

export function getStatusLabel(status) {
    switch (status) {
        case 'available': return 'Available';
        case 'in_use': return 'In Use';
        case 'maintenance': return 'Maintenance';
        case 'offline': return 'Offline';
        default: return status;
    }
}

export function getVehicleIcon(type) {
    switch (type) {
        case 'truck': return Truck;
        case 'bus': return Bus;
        case 'motorcycle': return Bike;
        default: return Car;
    }
}

export function formatTime(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatSpeed(speed) {
    return speed != null ? `${Math.round(speed)} km/h` : '—';
}
