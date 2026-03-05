import Constants from 'expo-constants';

// Use your PC's IP address (from ipconfig) so the mobile app can reach the Next.js API
const BASE_URL = 'http://127.0.0.1:3000';

export const apiClient = {
    get: async (endpoint) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API Get Error (${endpoint}):`, error);
            throw error;
        }
    },
    post: async (endpoint, data) => {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`API Post Error (${endpoint}):`, error);
            throw error;
        }
    }
};

export const API_ENDPOINTS = {
    VEHICLES: '/api/data?type=vehicles',
    POSITIONS: '/api/data?type=positions',
    ASSIGNMENTS: '/api/data?type=assignments',
    POST_GPS: '/api/data'
};
