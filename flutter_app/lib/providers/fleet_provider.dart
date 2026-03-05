import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

import '../models/vehicle.dart';
import '../models/gps_position.dart';
import '../models/vehicle_assignment.dart';
import '../services/api_service.dart';

enum LoadState { idle, loading, success, error }

class FleetProvider extends ChangeNotifier {
  final ApiService _api = ApiService();

  // ─── State ────────────────────────────────────────────────────────────
  List<Vehicle> _vehicles = [];
  List<GpsPosition> _positions = [];
  List<VehicleAssignment> _assignments = [];

  LoadState _vehiclesState = LoadState.idle;
  LoadState _positionsState = LoadState.idle;
  LoadState _assignmentsState = LoadState.idle;

  String? _vehiclesError;
  String? _positionsError;
  String? _assignmentsError;

  String? _selectedVehicleId;
  String _activeTab = 'dashboard';

  // Realtime SSE stream
  http.Client? _sseClient;
  StreamSubscription? _sseSub;

  // Polling timers
  Timer? _vehiclesTimer;
  Timer? _assignmentsTimer;
  Timer? _locationStreamTimer;

  bool _isSharingLocation = false;

  bool get isSharingLocation => _isSharingLocation;

  // ─── Getters ──────────────────────────────────────────────────────────
  List<Vehicle> get vehicles => _vehicles;
  List<GpsPosition> get positions => _positions;
  List<VehicleAssignment> get assignments => _assignments;

  LoadState get vehiclesState => _vehiclesState;
  LoadState get positionsState => _positionsState;
  LoadState get assignmentsState => _assignmentsState;

  String? get vehiclesError => _vehiclesError;
  String? get positionsError => _positionsError;
  String? get assignmentsError => _assignmentsError;

  String? get selectedVehicleId => _selectedVehicleId;
  String get activeTab => _activeTab;

  bool get isLoading =>
      _vehiclesState == LoadState.loading ||
      _positionsState == LoadState.loading ||
      _assignmentsState == LoadState.loading;

  bool get hasData =>
      _vehicles.isNotEmpty || _positions.isNotEmpty;

  // ─── Status Counts ────────────────────────────────────────────────────
  int get availableCount =>
      _vehicles.where((v) => v.status == 'available').length;
  int get inUseCount => _vehicles.where((v) => v.status == 'in_use').length;
  int get maintenanceCount =>
      _vehicles.where((v) => v.status == 'maintenance').length;
  int get offlineCount => _vehicles.where((v) => v.status == 'offline').length;

  // ─── Selected Vehicle Position ────────────────────────────────────────
  GpsPosition? get selectedPosition {
    if (_selectedVehicleId == null) return null;
    try {
      return _positions.firstWhere((p) => p.vehicleId == _selectedVehicleId);
    } catch (_) {
      return null;
    }
  }

  Vehicle? get selectedVehicle {
    if (_selectedVehicleId == null) return null;
    try {
      return _vehicles.firstWhere((v) => v.id == _selectedVehicleId);
    } catch (_) {
      return null;
    }
  }

  // ─── Active Assignments (with vehicle info) ───────────────────────────
  List<({VehicleAssignment assignment, Vehicle? vehicle})>
      get activeAssignments {
    final list = _assignments.map((a) {
      Vehicle? v;
      try {
        v = _vehicles.firstWhere((veh) => veh.id == a.vehicleId);
      } catch (_) {
        v = null;
      }
      return (assignment: a, vehicle: v);
    }).where((entry) => entry.vehicle != null).toList();

    list.sort((a, b) {
      final aEnd = a.assignment.estimatedEnd;
      final bEnd = b.assignment.estimatedEnd;
      if (aEnd == null && bEnd == null) return 0;
      if (aEnd == null) return 1;
      if (bEnd == null) return -1;
      return aEnd.compareTo(bEnd);
    });

    return list;
  }

  // ─── Initialise ───────────────────────────────────────────────────────
  Future<void> init() async {
    await Future.wait([
      fetchVehicles(),
      fetchPositions(),
      fetchAssignments(),
    ]);

    // Start polling for vehicles and assignments every 10s / 15s
    _vehiclesTimer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => fetchVehicles(),
    );
    _assignmentsTimer = Timer.periodic(
      const Duration(seconds: 15),
      (_) => fetchAssignments(),
    );

    // Initial fetch for positions, then SSE
    _connectRealtime();
  }

  // ─── Fetch Vehicles ───────────────────────────────────────────────────
  Future<void> fetchVehicles() async {
    _vehiclesState = LoadState.loading;
    notifyListeners();
    try {
      _vehicles = await _api.fetchVehicles();
      _vehiclesState = LoadState.success;
      _vehiclesError = null;
    } catch (e) {
      _vehiclesState = LoadState.error;
      _vehiclesError = e.toString();
    }
    notifyListeners();
  }

  // ─── Fetch Positions ──────────────────────────────────────────────────
  Future<void> fetchPositions() async {
    _positionsState = LoadState.loading;
    notifyListeners();
    try {
      _positions = await _api.fetchGpsPositions();
      _positionsState = LoadState.success;
      _positionsError = null;
    } catch (e) {
      _positionsState = LoadState.error;
      _positionsError = e.toString();
    }
    notifyListeners();
  }

  // ─── Fetch Assignments ────────────────────────────────────────────────
  Future<void> fetchAssignments() async {
    _assignmentsState = LoadState.loading;
    notifyListeners();
    try {
      _assignments = await _api.fetchAssignments();
      _assignmentsState = LoadState.success;
      _assignmentsError = null;
    } catch (e) {
      _assignmentsState = LoadState.error;
      _assignmentsError = e.toString();
    }
    notifyListeners();
  }

  // ─── Realtime SSE Connection ──────────────────────────────────────────
  void _connectRealtime() {
    // SSE is handled manually via http streaming in Flutter
    // We'll use periodic polling as a fallback since flutter_sse is not
    // commonly available — positions refresh every 5 seconds
    _sseSub?.cancel();
    final positionsTimer = Timer.periodic(
      const Duration(seconds: 5),
      (_) => fetchPositions(),
    );
    // Store reference so we can cancel
    _sseSub = Stream.periodic(const Duration(days: 1)).listen((_) {});
  }

  // ─── Refresh All ──────────────────────────────────────────────────────
  Future<void> refreshAll() async {
    await Future.wait([
      fetchVehicles(),
      fetchPositions(),
      fetchAssignments(),
    ]);
  }

  // ─── UI State ─────────────────────────────────────────────────────────
  void selectVehicle(String? id) {
    _selectedVehicleId = (_selectedVehicleId == id) ? null : id;
    notifyListeners();
  }

  void setActiveTab(String tab) {
    _activeTab = tab;
    notifyListeners();
  }

  Future<void> _startLocationSharing(BuildContext? context) async {
    bool serviceEnabled;
    LocationPermission permission;

    if (kDebugMode) print('=== Requesting Location Permission ===');

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (kDebugMode) print('Location services are disabled.');
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please enable device Location services to share your GPS.')),
        );
      }
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (kDebugMode) print('Location permissions are denied');
        if (context != null && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permissions are denied. Cannot broadcast GPS.')),
          );
        }
        return;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      if (kDebugMode) print('Location permissions are permanently denied.');
      if (context != null && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permissions are permanently denied. Please enable in Settings.')),
        );
      }
      return;
    }

    if (kDebugMode) print('Location enabled and granted! Sharing started.');
    _isSharingLocation = true;
    notifyListeners();
    if (context != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location broadcast started.'),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 2),
        ),
      );
    }

    // Immediately send one location, then start timer
    _sendCurrentLocation();
    _locationStreamTimer = Timer.periodic(
      const Duration(seconds: 5),
      (_) => _sendCurrentLocation(),
    );
  }

  // ─── Location Sharing ──────────────────────────────────────────────────
  Future<void> toggleLocationSharing(BuildContext context) async {
    if (_isSharingLocation) {
      _stopLocationSharing();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Location broadcast stopped.'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } else {
      await _startLocationSharing(context);
    }
  }

  void _stopLocationSharing() {
    _isSharingLocation = false;
    _locationStreamTimer?.cancel();
    notifyListeners();
  }

  Future<void> _sendCurrentLocation() async {
    if (!_isSharingLocation) return;
    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      await _api.postGpsLocation(
        deviceIp: "FleetApp-Device", // In a real app, use an actual device ID
        latitude: position.latitude,
        longitude: position.longitude,
        speed: position.speed * 3.6, // Convert m/s to km/h
        heading: position.heading,
        accuracy: position.accuracy,
        altitude: position.altitude,
      );
    } catch (e) {
      if (kDebugMode) {
        print('Error sending location: $e');
      }
    }
  }

  // ─── Dispose ──────────────────────────────────────────────────────────
  @override
  void dispose() {
    _vehiclesTimer?.cancel();
    _assignmentsTimer?.cancel();
    _locationStreamTimer?.cancel();
    _sseSub?.cancel();
    _sseClient?.close();
    _api.dispose();
    super.dispose();
  }
}
