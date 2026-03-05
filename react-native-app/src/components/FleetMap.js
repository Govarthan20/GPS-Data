import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, Navigation, Truck, Car, Bus } from 'lucide-react-native';

const VehicleIcons = {
    truck: Truck,
    car: Car,
    van: Bus,
    sedan: Car,
    suv: Car,
    bus: Bus,
    motorcycle: Navigation,
};

const FleetMap = ({ positions, deviceLocation, onSelectVehicle, selectedVehicle }) => {
    // Center map on device location if available, otherwise a default
    const initialRegion = {
        latitude: deviceLocation?.latitude || (positions.length > 0 ? positions[0].latitude : 12.9716),
        longitude: deviceLocation?.longitude || (positions.length > 0 ? positions[0].longitude : 77.5946),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
            >
                {/* Device Current Location Marker */}
                {deviceLocation && (
                    <Marker
                        coordinate={{
                            latitude: deviceLocation.latitude,
                            longitude: deviceLocation.longitude,
                        }}
                        title="You are here"
                        pinColor="#3b82f6"
                    >
                        <View style={styles.userMarker}>
                            <View style={styles.userMarkerPulse} />
                            <View style={styles.userMarkerDot} />
                        </View>
                    </Marker>
                )}

                {/* Fleet Vehicle Markers */}
                {positions.map((pos) => {
                    const VehicleIcon = VehicleIcons[pos.vehicle_type?.toLowerCase()] || Car;
                    const isSelected = selectedVehicle === pos.vehicle_id;
                    const markerColor = pos.vehicle_status === 'available' ? '#00a650' :
                        pos.vehicle_status === 'in_use' ? '#3b82f6' : '#94a3b8';

                    return (
                        <Marker
                            key={pos.id || pos.vehicle_id}
                            coordinate={{
                                latitude: pos.latitude,
                                longitude: pos.longitude,
                            }}
                            onPress={() => onSelectVehicle(pos.vehicle_id)}
                            flat={true}
                            anchor={{ x: 0.5, y: 0.5 }}
                            rotation={pos.heading || 0}
                        >
                            <View style={[
                                styles.vehicleMarker,
                                { borderColor: markerColor },
                                isSelected && styles.selectedMarker
                            ]}>
                                <VehicleIcon size={18} color={markerColor} strokeWidth={2.5} />
                            </View>

                            <Callout tooltip>
                                <View style={styles.callout}>
                                    <Text style={styles.calloutTitle}>{pos.vehicle_name || 'Vehicle'}</Text>
                                    <Text style={styles.calloutText}>{pos.plate_number}</Text>
                                    <Text style={styles.calloutText}>{pos.speed ? `${Math.round(pos.speed)} km/h` : '0 km/h'}</Text>
                                    <Text style={[styles.calloutStatus, { color: markerColor }]}>
                                        {pos.vehicle_status?.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.mapControls}>
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#00a650' }]} />
                        <Text style={styles.legendText}>Available</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                        <Text style={styles.legendText}>In Use</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#94a3b8' }]} />
                        <Text style={styles.legendText}>Offline</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    vehicleMarker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#0c1a3a',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    selectedMarker: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: '#00cc62', // Greener highlight for selection
    },
    callout: {
        width: 160,
        backgroundColor: '#0c1a3a',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    calloutTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    calloutText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    calloutStatus: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    },
    userMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMarkerDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#3b82f6',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userMarkerPulse: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
    },
    mapControls: {
        position: 'absolute',
        top: 50,
        right: 20,
        gap: 12,
    },
    legend: {
        backgroundColor: 'rgba(12, 26, 58, 0.85)',
        padding: 12,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '500',
    },
});

export default FleetMap;
