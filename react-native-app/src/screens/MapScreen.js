import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import FleetMap from '../components/FleetMap';

const MapScreen = ({ positions, onRefresh }) => {
    const [deviceLocation, setDeviceLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoadingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setDeviceLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            setLoadingLocation(false);
        })();
    }, []);

    if (loadingLocation) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00a650" />
                <Text style={styles.text}>Initializing Map...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FleetMap
                positions={positions}
                deviceLocation={deviceLocation}
                onSelectVehicle={(id) => console.log('Selected:', id)}
            />
            {errorMsg && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0c1a3a',
    },
    center: {
        flex: 1,
        backgroundColor: '#0c1a3a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#94a3b8',
        marginTop: 10,
    },
    errorBanner: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#dc2626',
        padding: 12,
        borderRadius: 8,
    },
    errorText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default MapScreen;
