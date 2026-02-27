import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export function useDeviceLocation() {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let watchId = null;
        let browserWatchId = null;

        const startTracking = async () => {
            const isWeb = Capacitor.getPlatform() === 'web';

            if (isWeb) {
                // Fallback to Browser Geolocation SDK for Web
                if (!navigator.geolocation) {
                    setError('Geolocation not supported in this browser');
                    return;
                }

                browserWatchId = navigator.geolocation.watchPosition(
                    (position) => {
                        setLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            speed: (position.coords.speed || 0) * 3.6, // convert to km/h
                            heading: position.coords.heading || 0,
                            accuracy: position.coords.accuracy,
                            recorded_at: new Date(position.timestamp).toISOString()
                        });
                        setError(null); // Clear errors on success
                    },
                    (err) => {
                        // GeolocationPositionError doesn't stringify well, so we extract details
                        const errorMap = {
                            1: "Permission Denied: Please enable location access in your browser.",
                            2: "Position Unavailable: GPS signal not found. Try moving near a window.",
                            3: "GPS Timeout: It's taking a while to find you. Ensure location is enabled on your device."
                        };
                        const msg = errorMap[err.code] || err.message || "An unknown GPS error occurred.";
                        console.error(`Browser GPS Error [${err.code}]: ${msg}`);
                        setError(msg);
                    },
                    { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
                );
            } else {
                // Native Capacitor SDK for Mobile
                try {
                    const permission = await Geolocation.checkPermissions();
                    if (permission.location !== 'granted') {
                        await Geolocation.requestPermissions();
                    }

                    watchId = await Geolocation.watchPosition({
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }, (position, err) => {
                        if (err) {
                            console.error('Mobile GPS Error:', err);
                            setError(err);
                            return;
                        }
                        if (position) {
                            setLocation({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                speed: (position.coords.speed || 0) * 3.6,
                                heading: position.coords.heading || 0,
                                accuracy: position.coords.accuracy,
                                recorded_at: new Date(position.timestamp).toISOString()
                            });
                        }
                    });
                } catch (err) {
                    console.error('Failed to start native tracking:', err);
                    setError(err);
                }
            }
        };

        startTracking();

        return () => {
            if (watchId) {
                Geolocation.clearWatch({ id: watchId });
            }
            if (browserWatchId) {
                navigator.geolocation.clearWatch(browserWatchId);
            }
        };
    }, []);

    return { location, error };
}
