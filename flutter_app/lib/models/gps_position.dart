/// GPS Location data model (matches vehicle_latest_positions DB view)
class GpsPosition {
  final String vehicleId;
  final double latitude;
  final double longitude;
  final double speed;
  final double heading;
  final double? accuracy;
  final DateTime? recordedAt;
  final String? vehicleName;
  final String? plateNumber;
  final String? vehicleType;
  final String? vehicleStatus;
  final String? driverName;
  final double? fuelLevel;

  const GpsPosition({
    required this.vehicleId,
    required this.latitude,
    required this.longitude,
    this.speed = 0,
    this.heading = 0,
    this.accuracy,
    this.recordedAt,
    this.vehicleName,
    this.plateNumber,
    this.vehicleType,
    this.vehicleStatus,
    this.driverName,
    this.fuelLevel,
  });

  factory GpsPosition.fromJson(Map<String, dynamic> json) {
    return GpsPosition(
      vehicleId: json['vehicle_id']?.toString() ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
      speed: (json['speed'] as num?)?.toDouble() ?? 0,
      heading: (json['heading'] as num?)?.toDouble() ?? 0,
      accuracy: (json['accuracy'] as num?)?.toDouble(),
      recordedAt: json['recorded_at'] != null
          ? DateTime.tryParse(json['recorded_at'].toString())
          : null,
      vehicleName: json['vehicle_name']?.toString(),
      plateNumber: json['plate_number']?.toString(),
      vehicleType: json['vehicle_type']?.toString(),
      vehicleStatus: json['vehicle_status']?.toString(),
      driverName: json['driver_name']?.toString(),
      fuelLevel: (json['fuel_level'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'vehicle_id': vehicleId,
        'latitude': latitude,
        'longitude': longitude,
        'speed': speed,
        'heading': heading,
        'accuracy': accuracy,
        'recorded_at': recordedAt?.toIso8601String(),
        'vehicle_name': vehicleName,
        'plate_number': plateNumber,
        'vehicle_type': vehicleType,
        'vehicle_status': vehicleStatus,
        'driver_name': driverName,
        'fuel_level': fuelLevel,
      };

  GpsPosition copyWith({
    double? latitude,
    double? longitude,
    double? speed,
    double? heading,
    DateTime? recordedAt,
    String? vehicleStatus,
    double? fuelLevel,
  }) {
    return GpsPosition(
      vehicleId: vehicleId,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      speed: speed ?? this.speed,
      heading: heading ?? this.heading,
      accuracy: accuracy,
      recordedAt: recordedAt ?? this.recordedAt,
      vehicleName: vehicleName,
      plateNumber: plateNumber,
      vehicleType: vehicleType,
      vehicleStatus: vehicleStatus ?? this.vehicleStatus,
      driverName: driverName,
      fuelLevel: fuelLevel ?? this.fuelLevel,
    );
  }
}
