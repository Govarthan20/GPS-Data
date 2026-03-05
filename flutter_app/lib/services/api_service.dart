import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/vehicle.dart';
import '../models/gps_position.dart';
import '../models/vehicle_assignment.dart';

/// API Service that connects to the Next.js backend (same NeonDB)
class ApiService {
  // ─── Base URL ─────────────────────────────────────────────────────────
  // Change this to your actual server IP when running on a device.
  // For Android emulator, use 10.0.2.2 to access host loopback.
  // For physical device on same WiFi, use your PC's LAN IP (e.g., 192.168.x.x:3000)
  static const String _baseUrl = 'http://127.0.0.1:3000';

  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final http.Client _client = http.Client();

  // ─── Headers ──────────────────────────────────────────────────────────
  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  // ─── Fetch Vehicles ───────────────────────────────────────────────────
  Future<List<Vehicle>> fetchVehicles() async {
    final uri = Uri.parse('$_baseUrl/api/data?type=vehicles');
    try {
      final response = await _client.get(uri, headers: _headers).timeout(
        const Duration(seconds: 10),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Vehicle.fromJson(json)).toList();
      } else {
        throw ApiException('Failed to fetch vehicles: ${response.statusCode}');
      }
    } catch (e) {
      throw ApiException('Network error fetching vehicles: $e');
    }
  }

  // ─── Fetch GPS Positions ──────────────────────────────────────────────
  Future<List<GpsPosition>> fetchGpsPositions() async {
    final uri = Uri.parse('$_baseUrl/api/data?type=positions');
    try {
      final response = await _client.get(uri, headers: _headers).timeout(
        const Duration(seconds: 10),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => GpsPosition.fromJson(json)).toList();
      } else {
        throw ApiException('Failed to fetch positions: ${response.statusCode}');
      }
    } catch (e) {
      throw ApiException('Network error fetching positions: $e');
    }
  }

  // ─── Fetch Assignments ────────────────────────────────────────────────
  Future<List<VehicleAssignment>> fetchAssignments() async {
    final uri = Uri.parse('$_baseUrl/api/data?type=assignments');
    try {
      final response = await _client.get(uri, headers: _headers).timeout(
        const Duration(seconds: 10),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => VehicleAssignment.fromJson(json)).toList();
      } else {
        throw ApiException(
            'Failed to fetch assignments: ${response.statusCode}');
      }
    } catch (e) {
      throw ApiException('Network error fetching assignments: $e');
    }
  }

  // ─── Post GPS Location ────────────────────────────────────────────────
  Future<void> postGpsLocation({
    required String deviceIp,
    required double latitude,
    required double longitude,
    double speed = 0,
    double heading = 0,
    double accuracy = 0,
    double altitude = 0,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/gps');
    try {
      final body = json.encode({
        'device_ip': deviceIp,
        'latitude': latitude,
        'longitude': longitude,
        'speed': speed,
        'heading': heading,
        'accuracy': accuracy,
        'altitude': altitude,
      });

      final response = await _client
          .post(uri, headers: _headers, body: body)
          .timeout(const Duration(seconds: 10));

      if (response.statusCode != 201) {
        throw ApiException('GPS post failed: ${response.statusCode}');
      }
    } catch (e) {
      throw ApiException('Network error posting GPS: $e');
    }
  }

  void dispose() {
    _client.close();
  }
}

class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  @override
  String toString() => 'ApiException: $message';
}
