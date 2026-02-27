import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/* ──────────────────────────────────────
   Demo / Fallback Data
   (used when Supabase is not configured)
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

const DEMO_GPS = DEMO_VEHICLES.map((v, i) => ({
    vehicle_id: v.id,
    latitude: 19.0760 + (Math.random() - 0.5) * 0.08,
    longitude: 72.8777 + (Math.random() - 0.5) * 0.08,
    speed: Math.round(Math.random() * 80),
    heading: Math.round(Math.random() * 360),
    recorded_at: new Date(Date.now() - Math.random() * 300000).toISOString(),
    vehicle_name: v.name,
    plate_number: v.plate_number,
    vehicle_type: v.type,
    vehicle_status: v.status,
    driver_name: v.driver_name,
    fuel_level: v.fuel_level,
}));

const DEMO_ASSIGNMENTS = DEMO_VEHICLES
    .filter(v => v.status === 'in_use')
    .map(v => ({
        id: `assign-${v.id}`,
        vehicle_id: v.id,
        assigned_to: v.driver_name,
        department: 'Operations',
        purpose: 'Field Visit',
        start_time: new Date(Date.now() - 2 * 3600000).toISOString(),
        estimated_end: new Date(Date.now() + (1 + Math.random() * 3) * 3600000).toISOString(),
        actual_end: null,
    }));

function isSupabaseConfigured() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url && !url.includes('your-project');
}

/* ──────────────────────────────────────
   useVehicles Hook
   ────────────────────────────────────── */
export function useVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVehicles = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setVehicles(DEMO_VEHICLES);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Supabase error fetching vehicles:', error.message, error.details, error.code);
                throw error;
            }
            setVehicles(data || []);
        } catch (err) {
            console.error('Caught error in fetchVehicles:', err);
            const errorMessage = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
            setError(errorMessage);
            setVehicles(DEMO_VEHICLES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();

        if (!isSupabaseConfigured()) return;

        // Realtime subscription for vehicle status changes
        const channel = supabase
            .channel('vehicles-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setVehicles(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'UPDATE') {
                    setVehicles(prev => prev.map(v => v.id === payload.new.id ? payload.new : v));
                } else if (payload.eventType === 'DELETE') {
                    setVehicles(prev => prev.filter(v => v.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
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
        if (!isSupabaseConfigured()) {
            setPositions(DEMO_GPS);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vehicle_latest_positions')
                .select('*');

            if (error) {
                console.error('Supabase error fetching GPS positions:', error.message, error.details, error.code);
                throw error;
            }
            setPositions(data || []);
        } catch (err) {
            console.error('Caught error in fetchPositions:', err);
            setError(err.message || 'Unknown error');
            setPositions(DEMO_GPS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPositions();

        if (!isSupabaseConfigured()) {
            // Simulate live GPS updates in demo mode
            const interval = setInterval(() => {
                setPositions(prev => prev.map(p => ({
                    ...p,
                    latitude: p.latitude + (Math.random() - 0.5) * 0.002,
                    longitude: p.longitude + (Math.random() - 0.5) * 0.002,
                    speed: Math.max(0, Math.min(120, p.speed + (Math.random() - 0.5) * 10)),
                    heading: (p.heading + (Math.random() - 0.5) * 30 + 360) % 360,
                    recorded_at: new Date().toISOString(),
                })));
            }, 3000);
            return () => clearInterval(interval);
        }

        // Realtime subscription for GPS updates
        const channel = supabase
            .channel('gps-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gps_locations' }, (payload) => {
                const newLoc = payload.new;
                setPositions(prev => {
                    const existing = prev.findIndex(p => p.vehicle_id === newLoc.vehicle_id);
                    if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = { ...updated[existing], ...newLoc };
                        return updated;
                    }
                    return [...prev, newLoc];
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
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
        if (!isSupabaseConfigured()) {
            setAssignments(DEMO_ASSIGNMENTS);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vehicle_assignments')
                .select('*')
                .is('actual_end', null)
                .order('estimated_end', { ascending: true });

            if (error) {
                console.error('Supabase error fetching assignments:', error.message, error.details, error.code);
                throw error;
            }
            setAssignments(data || []);
        } catch (err) {
            console.error('Caught error in fetchAssignments:', err);
            setAssignments(DEMO_ASSIGNMENTS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

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
