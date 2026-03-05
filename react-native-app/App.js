import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Map as MapIcon, Truck, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

// Import Screens (to be created next)
import DashboardScreen from './src/screens/DashboardScreen';
import MapScreen from './src/screens/MapScreen';
import VehiclesScreen from './src/screens/VehiclesScreen';
import WaitTimeScreen from './src/screens/WaitTimeScreen';

// Hooks
import { useFleetData } from './src/hooks/useFleetData';

const Tab = createBottomTabNavigator();

export default function App() {
  const { vehicles, positions, assignments, loading, error, refetch } = useFleetData();

  if (loading && !vehicles.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00a650" />
        <Text style={styles.loadingText}>Connecting to FleetPulse...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: {
            backgroundColor: '#0c1a3a',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.05)',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          tabBarStyle: {
            backgroundColor: '#0c1a3a',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.05)',
            height: 90,
            paddingBottom: 25,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#00a650',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarIcon: ({ color, size }) => {
            let icon;
            if (route.name === 'Dashboard') {
              icon = <LayoutDashboard size={size} color={color} />;
            } else if (route.name === 'Map') {
              icon = <MapIcon size={size} color={color} />;
            } else if (route.name === 'Vehicles') {
              icon = <Truck size={size} color={color} />;
            } else if (route.name === 'Wait Times') {
              icon = <Clock size={size} color={color} />;
            }
            return icon;
          },
        })}
      >
        <Tab.Screen name="Dashboard">
          {(props) => <DashboardScreen {...props} vehicles={vehicles} onRefresh={refetch} />}
        </Tab.Screen>
        <Tab.Screen name="Map">
          {(props) => <MapScreen {...props} positions={positions} onRefresh={refetch} />}
        </Tab.Screen>
        <Tab.Screen name="Vehicles">
          {(props) => <VehiclesScreen {...props} vehicles={vehicles} positions={positions} onRefresh={refetch} />}
        </Tab.Screen>
        <Tab.Screen name="Wait Times">
          {(props) => <WaitTimeScreen {...props} assignments={assignments} vehicles={vehicles} onRefresh={refetch} />}
        </Tab.Screen>
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c1a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
});
