import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../models/gps_position.dart';
import '../providers/fleet_provider.dart';
import '../theme/app_theme.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final MapController _mapController = MapController();
  bool _mapReady = false;

  // Default center: Mumbai (matches the Next.js app)
  static const LatLng _defaultCenter = LatLng(19.0760, 72.8777);

  @override
  Widget build(BuildContext context) {
    return Consumer<FleetProvider>(
      builder: (context, fleet, _) {
        final positions = fleet.positions;

        // Calculate center
        LatLng center = _defaultCenter;
        if (fleet.selectedPosition != null) {
          center = LatLng(
            fleet.selectedPosition!.latitude,
            fleet.selectedPosition!.longitude,
          );
        } else if (positions.isNotEmpty) {
          final avgLat =
              positions.map((p) => p.latitude).reduce((a, b) => a + b) /
                  positions.length;
          final avgLng =
              positions.map((p) => p.longitude).reduce((a, b) => a + b) /
                  positions.length;
          center = LatLng(avgLat, avgLng);
        }

        return Stack(
          children: [
            // ── Flutter Map ─────────────────────────────────────────────
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: center,
                initialZoom: 12,
                onMapReady: () => setState(() => _mapReady = true),
              ),
              children: [
                // CartoDB Dark Matter tiles (same as Next.js app)
                TileLayer(
                  urlTemplate:
                      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                  subdomains: const ['a', 'b', 'c'],
                  userAgentPackageName: 'com.vedanta.fleetpulse',
                  maxNativeZoom: 19,
                ),

                // Vehicle Markers Layer
                MarkerLayer(
                  markers: positions
                      .map((pos) => _buildVehicleMarker(pos, fleet))
                      .toList(),
                ),
              ],
            ),

            // ── Live Info Overlay ────────────────────────────────────────
            Positioned(
              bottom: 20,
              left: 16,
              right: 16,
              child: _buildMapOverlay(fleet),
            ),

            // ── Selected Vehicle Card ────────────────────────────────────
            if (fleet.selectedPosition != null)
              Positioned(
                top: 16,
                left: 16,
                right: 16,
                child: _buildSelectedVehicleCard(fleet),
              ),

            // ── Zoom Controls ────────────────────────────────────────────
            Positioned(
              bottom: 90,
              right: 16,
              child: _buildZoomControls(),
            ),

            // ── Center on vehicles button ─────────────────────────────────
            Positioned(
              bottom: 90,
              left: 16,
              child: _buildCenterButton(fleet),
            ),
          ],
        );
      },
    );
  }

  Marker _buildVehicleMarker(GpsPosition pos, FleetProvider fleet) {
    final isSelected = fleet.selectedVehicleId == pos.vehicleId;
    final status = pos.vehicleStatus ?? '';
    final color = AppTheme.statusColor(status);

    return Marker(
      point: LatLng(pos.latitude, pos.longitude),
      width: isSelected ? 48 : 36,
      height: isSelected ? 48 : 36,
      child: GestureDetector(
        onTap: () {
          fleet.selectVehicle(pos.vehicleId);
          _mapController.move(
            LatLng(pos.latitude, pos.longitude),
            _mapController.camera.zoom,
          );
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Glow ring for selected
              if (isSelected)
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: color.withOpacity(0.15),
                    border: Border.all(color: color, width: 2),
                  ),
                ),
              // Vehicle dot
              Transform.rotate(
                angle: (pos.heading * 3.14159) / 180,
                child: Container(
                  width: isSelected ? 28 : 22,
                  height: isSelected ? 28 : 22,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: color.withOpacity(0.6),
                        blurRadius: 8,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Icon(
                    _getVehicleIcon(pos.vehicleType ?? ''),
                    color: Colors.white,
                    size: isSelected ? 14 : 11,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getVehicleIcon(String type) {
    switch (type) {
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

  Widget _buildSelectedVehicleCard(FleetProvider fleet) {
    final pos = fleet.selectedPosition!;
    final vehicle = fleet.selectedVehicle;
    final status = pos.vehicleStatus ?? '';
    final color = AppTheme.statusColor(status);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: AppTheme.glassCard(
        borderColor: color.withOpacity(0.4),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withOpacity(0.4)),
            ),
            child: Icon(
              _getVehicleIcon(pos.vehicleType ?? ''),
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  pos.vehicleName ?? vehicle?.name ?? 'Vehicle',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                ),
                Text(
                  '${pos.plateNumber ?? ''} • ${_formatSpeed(pos.speed)}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: color.withOpacity(0.4)),
            ),
            child: Text(
              AppTheme.statusLabel(status),
              style: TextStyle(
                color: color,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => fleet.selectVehicle(null),
            child: const Icon(
              Icons.close_rounded,
              color: AppTheme.textMuted,
              size: 18,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapOverlay(FleetProvider fleet) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: AppTheme.glassCard(
        borderColor: AppTheme.green.withOpacity(0.2),
      ),
      child: Row(
        children: [
          _PulsingDot(color: AppTheme.green),
          const SizedBox(width: 8),
          Text(
            'Live Tracking',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          Text(
            ' • ${fleet.positions.length} vehicles',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textSecondary,
                ),
          ),
          const Spacer(),
          // Legend
          ...[
            ('Available', AppTheme.green),
            ('In Use', AppTheme.accent),
            ('Offline', AppTheme.red),
          ].map(
            (item) => Padding(
              padding: const EdgeInsets.only(left: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: item.$2,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    item.$1,
                    style: const TextStyle(
                      color: AppTheme.textMuted,
                      fontSize: 9,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildZoomControls() {
    return Column(
      children: [
        _MapButton(
          icon: Icons.add_rounded,
          onTap: () {
            final z = _mapController.camera.zoom;
            _mapController.move(_mapController.camera.center, z + 1);
          },
        ),
        const SizedBox(height: 8),
        _MapButton(
          icon: Icons.remove_rounded,
          onTap: () {
            final z = _mapController.camera.zoom;
            _mapController.move(_mapController.camera.center, z - 1);
          },
        ),
      ],
    );
  }

  Widget _buildCenterButton(FleetProvider fleet) {
    return _MapButton(
      icon: Icons.my_location_rounded,
      onTap: () {
        if (fleet.positions.isNotEmpty) {
          final avgLat =
              fleet.positions.map((p) => p.latitude).reduce((a, b) => a + b) /
                  fleet.positions.length;
          final avgLng =
              fleet.positions.map((p) => p.longitude).reduce((a, b) => a + b) /
                  fleet.positions.length;
          _mapController.move(LatLng(avgLat, avgLng), 12);
        }
      },
    );
  }

  String _formatSpeed(double speed) {
    return '${speed.round()} km/h';
  }
}

// ── Helper Widgets ────────────────────────────────────────────────────────────

class _MapButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _MapButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: AppTheme.glassCard(borderRadius: 12),
        child: Icon(icon, color: AppTheme.textPrimary, size: 20),
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  final Color color;
  const _PulsingDot({required this.color});

  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _anim = Tween(begin: 0.4, end: 1.0).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: widget.color.withOpacity(_anim.value),
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: widget.color.withOpacity(_anim.value * 0.5),
              blurRadius: 6,
              spreadRadius: 2,
            ),
          ],
        ),
      ),
    );
  }
}
