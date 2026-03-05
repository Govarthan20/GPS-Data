import React from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl } from 'react-native';
import { Truck, AlertCircle, CheckCircle2, Navigation } from 'lucide-react-native';

const StatusCard = ({ title, value, color, icon: Icon }) => (
    <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Icon size={24} color={color} />
        </View>
        <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardValue}>{value}</Text>
        </View>
    </View>
);

const DashboardScreen = ({ vehicles, onRefresh }) => {
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    const stats = {
        total: vehicles.length,
        available: vehicles.filter(v => v.status === 'available').length,
        inUse: vehicles.filter(v => v.status === 'in_use').length,
        offline: vehicles.filter(v => v.status === 'offline').length,
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#00a650" />
            }
        >
            <View style={styles.header}>
                <Text style={styles.welcome}>Fleet Overview</Text>
                <Text style={styles.subtitle}>Real-time status tracking</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.row}>
                    <StatusCard title="Total Fleet" value={stats.total} color="#00a650" icon={Truck} />
                    <StatusCard title="Available" value={stats.available} color="#00a650" icon={CheckCircle2} />
                </View>
                <View style={styles.row}>
                    <StatusCard title="In Use" value={stats.inUse} color="#3b82f6" icon={Navigation} />
                    <StatusCard title="Maintenance" value={stats.offline} color="#dc2626" icon={AlertCircle} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>
                        Operational Efficiency: {stats.total > 0 ? Math.round((stats.inUse / stats.total) * 100) : 0}%
                    </Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${stats.total > 0 ? (stats.inUse / stats.total) * 100 : 0}%` }
                            ]}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0c1a3a',
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    welcome: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
    },
    grid: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    card: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },
    cardValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        marginTop: 32,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    summaryBox: {
        backgroundColor: 'rgba(0,166,80,0.05)',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,166,80,0.2)',
    },
    summaryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#00a650',
    },
});

export default DashboardScreen;
