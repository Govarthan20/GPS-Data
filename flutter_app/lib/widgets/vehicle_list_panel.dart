import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/vehicle.dart';
import '../models/gps_position.dart';
import '../theme/app_theme.dart';

class VehicleListPanel extends StatefulWidget {
  final List<Vehicle> vehicles;
  final List<GpsPosition> positions;
  final String? selectedVehicleId;
  final void Function(String?) onSelectVehicle;

  const VehicleListPanel({
    super.key,
    required this.vehicles,
    required this.positions,
    this.selectedVehicleId,
    required this.onSelectVehicle,
  });

  @override
  State<VehicleListPanel> createState() => _VehicleListPanelState();
}

class _VehicleListPanelState extends State<VehicleListPanel> {
  String _filterStatus = 'all';
  final TextEditingController _searchCtrl = TextEditingController();

  List<Vehicle> get _filteredVehicles {
    var list = widget.vehicles;
    if (_filterStatus != 'all') {
      list = list.where((v) => v.status == _filterStatus).toList();
    }
    if (_searchCtrl.text.isNotEmpty) {
      final q = _searchCtrl.text.toLowerCase();
      list = list
          .where((v) =>
              v.name.toLowerCase().contains(q) ||
              v.plateNumber.toLowerCase().contains(q) ||
              (v.driverName?.toLowerCase().contains(q) ?? false))
          .toList();
    }
    return list;
  }

  GpsPosition? _positionFor(String vehicleId) {
    try {
      return widget.positions.firstWhere((p) => p.vehicleId == vehicleId);
    } catch (_) {
      return null;
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── Search & Filter Bar ───────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Column(
            children: [
              // Search
              Container(
                height: 42,
                decoration: AppTheme.glassCard(borderRadius: 12),
                child: TextField(
                  controller: _searchCtrl,
                  onChanged: (_) => setState(() {}),
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 14,
                  ),
                  decoration: const InputDecoration(
                    hintText: 'Search vehicles, plates, drivers...',
                    hintStyle: TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 13,
                    ),
                    prefixIcon: Icon(
                      Icons.search_rounded,
                      color: AppTheme.textMuted,
                      size: 18,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              // Status filter chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _FilterChip(
                      label: 'All (${widget.vehicles.length})',
                      value: 'all',
                      selected: _filterStatus == 'all',
                      onTap: () => setState(() => _filterStatus = 'all'),
                    ),
                    ...['available', 'in_use', 'maintenance', 'offline'].map(
                      (status) => _FilterChip(
                        label: AppTheme.statusLabel(status),
                        value: status,
                        selected: _filterStatus == status,
                        onTap: () =>
                            setState(() => _filterStatus = status),
                        color: AppTheme.statusColor(status),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ── Header ────────────────────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
          child: Row(
            children: [
              Text(
                'Fleet Vehicles',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const Spacer(),
              Text(
                '${_filteredVehicles.length} of ${widget.vehicles.length}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textMuted,
                    ),
              ),
            ],
          ),
        ),

        // ── List ──────────────────────────────────────────────────────────
        Expanded(
          child: _filteredVehicles.isEmpty
              ? _buildEmpty()
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  itemCount: _filteredVehicles.length,
                  itemBuilder: (_, i) {
                    final v = _filteredVehicles[i];
                    final pos = _positionFor(v.id);
                    final isSelected = widget.selectedVehicleId == v.id;
                    return _VehicleCard(
                      vehicle: v,
                      position: pos,
                      isSelected: isSelected,
                      onTap: () => widget.onSelectVehicle(v.id),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.directions_car_outlined,
            color: AppTheme.textMuted,
            size: 56,
          ),
          const SizedBox(height: 16),
          Text(
            'No vehicles found',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppTheme.textSecondary,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your search or filter',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textMuted,
                ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final String value;
  final bool selected;
  final VoidCallback onTap;
  final Color? color;

  const _FilterChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppTheme.accent;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? c.withOpacity(0.15) : AppTheme.navyCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? c : AppTheme.navyBorder,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? c : AppTheme.textMuted,
            fontSize: 12,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ),
    );
  }
}

class _VehicleCard extends StatelessWidget {
  final Vehicle vehicle;
  final GpsPosition? position;
  final bool isSelected;
  final VoidCallback onTap;

  const _VehicleCard({
    required this.vehicle,
    this.position,
    required this.isSelected,
    required this.onTap,
  });

  IconData get _vehicleIcon {
    switch (vehicle.type) {
      case 'truck':
        return Icons.local_shipping_rounded;
      case 'bus':
        return Icons.directions_bus_rounded;
      case 'motorcycle':
        return Icons.two_wheeler_rounded;
      default:
        return Icons.directions_car_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = vehicle.status;
    final color = AppTheme.statusColor(status);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.navyCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? color : AppTheme.navyBorder,
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: color.withOpacity(0.15),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ]
              : const [],
        ),
        child: Column(
          children: [
            Row(
              children: [
                // Vehicle icon
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: color.withOpacity(0.3)),
                  ),
                  child: Icon(_vehicleIcon, color: color, size: 22),
                ),
                const SizedBox(width: 12),

                // Name & plate
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        vehicle.name,
                        style:
                            Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.textPrimary,
                                ),
                      ),
                      Text(
                        vehicle.plateNumber,
                        style:
                            Theme.of(context).textTheme.bodySmall?.copyWith(
                                  color: AppTheme.textMuted,
                                  fontFamily: 'monospace',
                                ),
                      ),
                    ],
                  ),
                ),

                // Status badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: color.withOpacity(0.3)),
                  ),
                  child: Text(
                    AppTheme.statusLabel(status),
                    style: TextStyle(
                      color: color,
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),

            // ── Meta row ──────────────────────────────────────────────────
            if (position != null || vehicle.driverName != null) ...[
              const SizedBox(height: 10),
              const Divider(height: 1, color: AppTheme.navyBorder),
              const SizedBox(height: 10),
              Row(
                children: [
                  if (vehicle.driverName != null)
                    _MetaItem(
                      icon: Icons.person_outline_rounded,
                      label: vehicle.driverName!,
                    ),
                  if (position != null) ...[
                    const SizedBox(width: 12),
                    _MetaItem(
                      icon: Icons.speed_rounded,
                      label: '${position!.speed.round()} km/h',
                    ),
                    const SizedBox(width: 12),
                    _MetaItem(
                      icon: Icons.local_gas_station_rounded,
                      label: '${vehicle.fuelLevel.round()}%',
                    ),
                    const Spacer(),
                    _MetaItem(
                      icon: Icons.access_time_rounded,
                      label: _formatTime(position!.recordedAt),
                    ),
                  ],
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime? dt) {
    if (dt == null) return '—';
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    return DateFormat('HH:mm').format(dt);
  }
}

class _MetaItem extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MetaItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: AppTheme.textMuted, size: 12),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            color: AppTheme.textSecondary,
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
