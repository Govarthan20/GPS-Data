/// Vehicle Assignment model (matches vehicle_assignments table)
class VehicleAssignment {
  final String id;
  final String vehicleId;
  final String assignedTo;
  final String? department;
  final String? purpose;
  final DateTime startTime;
  final DateTime? estimatedEnd;
  final DateTime? actualEnd;
  final DateTime? createdAt;

  const VehicleAssignment({
    required this.id,
    required this.vehicleId,
    required this.assignedTo,
    this.department,
    this.purpose,
    required this.startTime,
    this.estimatedEnd,
    this.actualEnd,
    this.createdAt,
  });

  factory VehicleAssignment.fromJson(Map<String, dynamic> json) {
    return VehicleAssignment(
      id: json['id']?.toString() ?? '',
      vehicleId: json['vehicle_id']?.toString() ?? '',
      assignedTo: json['assigned_to']?.toString() ?? '',
      department: json['department']?.toString(),
      purpose: json['purpose']?.toString(),
      startTime: json['start_time'] != null
          ? DateTime.tryParse(json['start_time'].toString()) ?? DateTime.now()
          : DateTime.now(),
      estimatedEnd: json['estimated_end'] != null
          ? DateTime.tryParse(json['estimated_end'].toString())
          : null,
      actualEnd: json['actual_end'] != null
          ? DateTime.tryParse(json['actual_end'].toString())
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }

  /// Returns a human-readable wait time string
  String get waitTimeLabel {
    if (estimatedEnd == null) return 'Unknown';
    final diff = estimatedEnd!.difference(DateTime.now());
    if (diff.isNegative) return 'Due now';
    if (diff.inHours > 0) {
      return '${diff.inHours}h ${diff.inMinutes % 60}m';
    }
    return '${diff.inMinutes}m';
  }

  /// Returns true if due within 30 minutes
  bool get isDueSoon {
    if (estimatedEnd == null) return false;
    final diff = estimatedEnd!.difference(DateTime.now());
    return diff.inMinutes < 30;
  }

  bool get isOverdue {
    if (estimatedEnd == null) return false;
    return estimatedEnd!.isBefore(DateTime.now());
  }
}
