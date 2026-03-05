import React from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Truck, Navigation, Fuel, Activity, MapPin } from 'lucide-react-native';

const VehicleItem = ({ vehicle, position }) => {
    const statusColor = vehicle.status === 'available' ? '#00a650' :
        vehicle.status === 'in_use' ? '#3b82f6' : '#dc2626';

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.idSection}>
                    <View style={[styles.iconBox, { backgroundColor: `${statusColor}20` }]}>
                        <Truck size={20} color={statusColor} />
                    </View>
                    <View>
                        <Text style={styles.vehicleName}>{vehicle.name}</Text>
                        <Text style={styles.plateNumber}>{vehicle.plate_number}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {vehicle.status.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.metaItem}>
                    <Fuel size={14} color="#94a3b8" />
                    <Text style={styles.metaText}>{vehicle.fuel_level}%</Text>
                </View>
                <View style={styles.metaItem}>
                    <Activity size={14} color="#94a3b8" />
                    <Text style={styles.metaText}>{position?.speed ? `${Math.round(position.speed)}km/h` : 'Stopped'}</Text>
                </View>
                <View style={styles.metaItem}>
                    <MapPin size={14} color="#94a3b8" />
                    <Text style={styles.metaText} numberOfLines={1}>
                        {position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : 'No GPS'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const VehiclesScreen = ({ vehicles, positions, onRefresh }) => {
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <VehicleItem
                        vehicle={item}
                        position={positions.find(p => p.vehicle_id === item.id)}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00a650" />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No vehicles found in the fleet.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0c1a3a',
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    idSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vehicleName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    plateNumber: {
        color: '#94a3b8',
        fontSize: 12,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    metaText: {
        color: '#94a3b8',
        fontSize: 12,
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 40,
    }
});

export default VehiclesScreen;
