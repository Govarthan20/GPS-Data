import React from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl } from 'react-native';
import { Clock, User, Briefcase, Calendar } from 'lucide-react-native';

const AssignmentItem = ({ assignment, vehicleName }) => {
    const getWaitTime = (estimatedEnd) => {
        if (!estimatedEnd) return 'Unknown';
        const diff = new Date(estimatedEnd) - new Date();
        if (diff <= 0) return 'Due now';
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const waitTime = getWaitTime(assignment.estimated_end);
    const isDue = waitTime === 'Due now';

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.titleSection}>
                    <Text style={styles.vehicleName}>{vehicleName || 'Unknown Vehicle'}</Text>
                    <Text style={styles.purpose}>{assignment.purpose || 'General Assignment'}</Text>
                </View>
                <View style={[styles.timeBadge, isDue && styles.dueBadge]}>
                    <Text style={[styles.timeText, isDue && styles.dueText]}>{waitTime}</Text>
                </View>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <User size={14} color="#94a3b8" />
                    <Text style={styles.detailText}>{assignment.assigned_to}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Briefcase size={14} color="#94a3b8" />
                    <Text style={styles.detailText}>{assignment.department || 'N/A'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Calendar size={14} color="#94a3b8" />
                    <Text style={styles.detailText}>
                        Started: {new Date(assignment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const WaitTimeScreen = ({ assignments, vehicles, onRefresh }) => {
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={assignments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <AssignmentItem
                        assignment={item}
                        vehicleName={vehicles.find(v => v.id === item.vehicle_id)?.name}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00a650" />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Clock size={48} color="rgba(255,255,255,0.05)" />
                        <Text style={styles.emptyText}>No active assignments.</Text>
                    </View>
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
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    titleSection: {
        flex: 1,
    },
    vehicleName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    purpose: {
        color: '#94a3b8',
        fontSize: 14,
    },
    timeBadge: {
        backgroundColor: 'rgba(0,166,80,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    dueBadge: {
        backgroundColor: 'rgba(220,38,36,0.1)',
    },
    timeText: {
        color: '#00a650',
        fontWeight: 'bold',
        fontSize: 14,
    },
    dueText: {
        color: '#dc2626',
    },
    detailsGrid: {
        gap: 10,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailText: {
        color: '#94a3b8',
        fontSize: 13,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        color: '#94a3b8',
        marginTop: 16,
    }
});

export default WaitTimeScreen;
