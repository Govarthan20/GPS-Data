/// Vehicle data model (matches vehicles table)
class Vehicle {
  final String id;
  final String name;
  final String plateNumber;
  final String type;
  final String status;
  final String? driverName;
  final String? driverPhone;
  final double fuelLevel;
  final double totalDistance;
  final String? imageUrl;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Vehicle({
    required this.id,
    required this.name,
    required this.plateNumber,
    this.type = 'sedan',
    this.status = 'available',
    this.driverName,
    this.driverPhone,
    this.fuelLevel = 100,
    this.totalDistance = 0,
    this.imageUrl,
    this.createdAt,
    this.updatedAt,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Unknown',
      plateNumber: json['plate_number']?.toString() ?? '',
      type: json['type']?.toString() ?? 'sedan',
      status: json['status']?.toString() ?? 'available',
      driverName: json['driver_name']?.toString(),
      driverPhone: json['driver_phone']?.toString(),
      fuelLevel: (json['fuel_level'] as num?)?.toDouble() ?? 100,
      totalDistance: (json['total_distance'] as num?)?.toDouble() ?? 0,
      imageUrl: json['image_url']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'plate_number': plateNumber,
        'type': type,
        'status': status,
        'driver_name': driverName,
        'driver_phone': driverPhone,
        'fuel_level': fuelLevel,
        'total_distance': totalDistance,
        'image_url': imageUrl,
        'created_at': createdAt?.toIso8601String(),
        'updated_at': updatedAt?.toIso8601String(),
      };

  /// Returns icon name for this vehicle type
  String get typeIcon {
    switch (type) {
      case 'truck':
        return 'truck';
      case 'bus':
        return 'bus';
      case 'motorcycle':
        return 'bike';
      case 'suv':
        return 'suv';
      case 'van':
        return 'van';
      default:
        return 'car';
    }
  }
}
