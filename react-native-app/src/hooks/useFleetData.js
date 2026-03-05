import { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '../api/client';

export function useFleetData() {
    const [vehicles, setVehicles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [vData, pData, aData] = await Promise.all([
                apiClient.get(API_ENDPOINTS.VEHICLES),
                apiClient.get(API_ENDPOINTS.POSITIONS),
                apiClient.get(API_ENDPOINTS.ASSIGNMENTS)
            ]);
            setVehicles(vData);
            setPositions(pData);
            setAssignments(aData);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Fleet Data Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        // Use simple polling every 5 seconds for live feel
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return { vehicles, positions, assignments, loading, error, refetch: fetchData };
}
