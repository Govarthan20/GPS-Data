import { useState, useEffect, useCallback } from 'react';

/* ──────────────────────────────────────
   Demo / Fallback Data
   ────────────────────────────────────── */
const DEMO_VEHICLES = [
    { id: '1', name: 'Fleet Cruiser 01', plate_number: 'MH-01-AB-1234', type: 'sedan', status: 'available', driver_name: 'Rahul Sharma', fuel_level: 85 },
    { id: '2', name: 'Fleet Cruiser 02', plate_number: 'MH-01-CD-5678', type: 'sedan', status: 'in_use', driver_name: 'Priya Patel', fuel_level: 62 },
    { id: '3', name: 'Cargo Hauler 01', plate_number: 'MH-02-EF-9012', type: 'truck', status: 'in_use', driver_name: 'Amit Kumar', fuel_level: 45 },
    { id: '4', name: 'City Runner 01', plate_number: 'DL-03-GH-3456', type: 'van', status: 'maintenance', driver_name: 'Suresh Reddy', fuel_level: 30 },
    { id: '5', name: 'Highway Star 01', plate_number: 'KA-04-IJ-7890', type: 'suv', status: 'available', driver_name: 'Deepa Nair', fuel_level: 92 },
    { id: '6', name: 'Metro Express 01', plate_number: 'TN-05-KL-2345', type: 'bus', status: 'in_use', driver_name: 'Vijay Singh', fuel_level: 55 },
    { id: '7', name: 'Swift Rider 01', plate_number: 'GJ-06-MN-6789', type: 'motorcycle', status: 'available', driver_name: 'Karan Mehta', fuel_level: 78 },
    { id: '8', name: 'Fleet Cruiser 03', plate_number: 'RJ-07-OP-0123', type: 'sedan', status: 'offline', driver_name: 'Neha Gupta', fuel_level: 10 },
    { id: '9', name: 'Cargo Hauler 02', plate_number: 'UP-08-QR-4567', type: 'truck', status: 'available', driver_name: 'Ravi Verma', fuel_level: 70 },
    { id: '10', name: 'City Runner 02', plate_number: 'MP-09-ST-8901', type: 'van', status: 'in_use', driver_name: 'Anita Desai', fuel_level: 38 },
];

/* ──────────────────────────────────────
   useVehicles Hook
   ────────────────────────────────────── */
export function useVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/data?type=vehicles');
            if (!response.ok) throw new Error('Failed to fetch vehicles');
            const data = await response.json();
            setVehicles(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError(err.message);
            setVehicles(DEMO_VEHICLES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
        // Polling every 10 seconds since we don't have realtime yet
        const interval = setInterval(fetchVehicles, 10000);
        return () => clearInterval(interval);
    }, [fetchVehicles]);

    return { vehicles, loading, error, refetch: fetchVehicles };
}

/* ──────────────────────────────────────
   useGPSLocations Hook
   ────────────────────────────────────── */
export function useGPSLocations() {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPositions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/data?type=positions');
            if (!response.ok) throw new Error('Failed to fetch positions');
            const data = await response.json();
            setPositions(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching GPS positions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchPositions();

        // Connect to Realtime Update Stream (SSE)
        const eventSource = new EventSource('/api/realtime');

        eventSource.onmessage = (event) => {
            const update = JSON.parse(event.data);
            if (update.type === 'gps_update') {
                setPositions(currentPositions => {
                    // Update the position for this specific vehicle in place
                    const index = currentPositions.findIndex(p => p.vehicle_id === update.vehicle_id);
                    if (index !== -1) {
                        const newPositions = [...currentPositions];
                        newPositions[index] = { ...newPositions[index], ...update };
                        return newPositions;
                    }
                    // If not found in current list (rare in demo), add it
                    return [...currentPositions, update];
                });
            }
        };

        eventSource.onerror = (err) => {
            console.error('Realtime connection lost. Falling back to static data.', err);
            eventSource.close();
            // Optional: fallback polling could be re-enabled here if SSE is unreliable
        };

        return () => {
            eventSource.close();
        };
    }, [fetchPositions]);

    return { positions, loading, error, refetch: fetchPositions };
}

/* ──────────────────────────────────────
   useAssignments Hook
   ────────────────────────────────────── */
export function useAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/data?type=assignments');
            if (!response.ok) throw new Error('Failed to fetch assignments');
            const data = await response.json();
            setAssignments(data);
        } catch (err) {
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
        const interval = setInterval(fetchAssignments, 15000);
        return () => clearInterval(interval);
    }, [fetchAssignments]);

    return { assignments, loading, refetch: fetchAssignments };
}

/* ──────────────────────────────────────
   Helper: getWaitTime
   ────────────────────────────────────── */
export function getWaitTime(estimatedEnd) {
    if (!estimatedEnd) return 'Unknown';
    const diff = new Date(estimatedEnd) - new Date();
    if (diff <= 0) return 'Due now';
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

/* ──────────────────────────────────────
   Tracker Helper: Save GPS Data to DB
   ────────────────────────────────────── */
export async function saveGPSPosition(data) {
    try {
        const response = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to sync position');
        }

        return await response.json();
    } catch (err) {
        console.error('GPS Upload Error:', err);
        throw err;
    }
}
