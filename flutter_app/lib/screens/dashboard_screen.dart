import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/vehicle.dart';
import '../models/vehicle_assignment.dart';
import '../providers/fleet_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/app_header.dart';
import '../widgets/status_cards_row.dart';
import '../widgets/vehicle_list_panel.dart';
import '../widgets/wait_time_panel.dart';
import 'map_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _fadeCtrl.forward();
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    super.dispose();
  }

  void _onTabChanged(int index) {
    setState(() => _currentIndex = index);
    _fadeCtrl.reset();
    _fadeCtrl.forward();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<FleetProvider>(
      builder: (context, fleet, _) {
        return Scaffold(
          backgroundColor: AppTheme.navy,
          body: Container(
            decoration: AppTheme.gradientBackground,
            child: SafeArea(
              child: Column(
                children: [
                  // ── Header ─────────────────────────────────────────────
                  AppHeader(
                    onRefresh: fleet.refreshAll,
                    isLoading: fleet.isLoading,
                    isSharingLocation: fleet.isSharingLocation,
                    onToggleLocation: () => fleet.toggleLocationSharing(context),
                  ),

                  // ── Body ───────────────────────────────────────────────
                  Expanded(
                    child: FadeTransition(
                      opacity: _fadeAnim,
                      child: _buildBody(fleet),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Bottom Navigation ────────────────────────────────────────────
          bottomNavigationBar: _buildBottomNav(),
        );
      },
    );
  }

  Widget _buildBody(FleetProvider fleet) {
    switch (_currentIndex) {
      case 0:
        return _buildDashboardTab(fleet);
      case 1:
        return const MapScreen();
      case 2:
        return _buildVehiclesTab(fleet);
      case 3:
        return _buildWaitTimeTab(fleet);
      default:
        return _buildDashboardTab(fleet);
    }
  }

  Widget _buildDashboardTab(FleetProvider fleet) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Status Cards
          StatusCardsRow(vehicles: fleet.vehicles),
          const SizedBox(height: 20),

          // Live Map Preview Card
          _buildMapPreviewCard(fleet),
          const SizedBox(height: 20),

          // Quick Stats
          _buildQuickStats(fleet),
          const SizedBox(height: 20),

          // Recent Activity (latest assignments)
          if (fleet.activeAssignments.isNotEmpty) ...[
            _buildSectionTitle('Active Assignments'),
            const SizedBox(height: 12),
            ...fleet.activeAssignments.take(3).map(
                  (entry) => _buildMiniAssignmentCard(entry),
                ),
          ],
        ],
      ),
    );
  }

  Widget _buildMapPreviewCard(FleetProvider fleet) {
    return GestureDetector(
      onTap: () => _onTabChanged(1),
      child: Container(
        height: 200,
        decoration: AppTheme.glassCard(
          borderColor: AppTheme.accent.withOpacity(0.3),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // Dark gradient placeholder for map
            Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 1.5,
                  colors: [
                    Color(0xFF1A2F5A),
                    Color(0xFF0C1A3A),
                  ],
                ),
              ),
            ),
            // Grid overlay (simulates map tiles)
            CustomPaint(
              size: const Size(double.infinity, 200),
              painter: _MapGridPainter(),
            ),
            // Vehicle dots
            ...fleet.positions.take(8).map((pos) {
              // Normalize positions to screen coords (approximate)
              final totalPositions = fleet.positions.length;
              if (totalPositions == 0) return const SizedBox();
              final index = fleet.positions.indexOf(pos);
              final x = (index / totalPositions.clamp(1, 100)) *
                      MediaQuery.of(context).size.width +
                  20;
              final y = 60.0 + (index % 4) * 30;
              final color = AppTheme.statusColor(pos.vehicleStatus ?? '');
              return Positioned(
                left: x.clamp(20, MediaQuery.of(context).size.width - 40),
                top: y,
                child: Container(
                  width: 10,
                  height: 10,
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
                ),
              );
            }),
            // Overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    AppTheme.navy.withOpacity(0.7),
                  ],
                ),
              ),
            ),
            // Label
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: AppTheme.green,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.green.withOpacity(0.5),
                          blurRadius: 6,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Live Map • ${fleet.positions.length} vehicles tracked',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const Spacer(),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: AppTheme.textSecondary,
                    size: 14,
                  ),
                ],
              ),
            ),
            // Tap to open label
            const Positioned(
              top: 16,
              right: 16,
              child: _LiveBadge(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickStats(FleetProvider fleet) {
    final stats = [
      (
        label: 'Total Fleet',
        value: '${fleet.vehicles.length}',
        icon: Icons.directions_car_filled_rounded,
        color: AppTheme.accent
      ),
      (
        label: 'Active Now',
        value: '${fleet.positions.length}',
        icon: Icons.location_on_rounded,
        color: AppTheme.green
      ),
      (
        label: 'Assignments',
        value: '${fleet.assignments.length}',
        icon: Icons.assignment_rounded,
        color: AppTheme.amber
      ),
    ];

    return Row(
      children: stats
          .map(
            (s) => Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.glassCard(
                  borderColor: s.color.withOpacity(0.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(s.icon, color: s.color, size: 22),
                    const SizedBox(height: 8),
                    Text(
                      s.value,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: AppTheme.textPrimary,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    Text(
                      s.label,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textMuted,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildMiniAssignmentCard(
      ({VehicleAssignment assignment, Vehicle? vehicle}) entry) {
    final a = entry.assignment;
    final v = entry.vehicle;
    final color = a.isDueSoon ? AppTheme.amber : AppTheme.accent;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: AppTheme.glassCard(
        borderColor: color.withOpacity(0.2),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 40,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  v?.name ?? 'Vehicle',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                ),
                Text(
                  '${a.assignedTo}${a.purpose != null ? ' · ${a.purpose}' : ''}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                a.waitTimeLabel,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: color,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              Text(
                'est. return',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textMuted,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVehiclesTab(FleetProvider fleet) {
    return VehicleListPanel(
      vehicles: fleet.vehicles,
      positions: fleet.positions,
      selectedVehicleId: fleet.selectedVehicleId,
      onSelectVehicle: fleet.selectVehicle,
    );
  }

  Widget _buildWaitTimeTab(FleetProvider fleet) {
    return WaitTimePanel(
      activeAssignments: fleet.activeAssignments,
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.w700,
          ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.navyLight,
        border: const Border(
          top: BorderSide(color: AppTheme.navyBorder, width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: NavigationBar(
        backgroundColor: Colors.transparent,
        selectedIndex: _currentIndex,
        onDestinationSelected: _onTabChanged,
        elevation: 0,
        height: 65,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard_rounded),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.map_outlined),
            selectedIcon: Icon(Icons.map_rounded),
            label: 'Map',
          ),
          NavigationDestination(
            icon: Icon(Icons.directions_car_outlined),
            selectedIcon: Icon(Icons.directions_car_rounded),
            label: 'Vehicles',
          ),
          NavigationDestination(
            icon: Icon(Icons.timer_outlined),
            selectedIcon: Icon(Icons.timer_rounded),
            label: 'Wait Times',
          ),
        ],
      ),
    );
  }
}

// ── Helper Widgets ────────────────────────────────────────────────────────────

class _LiveBadge extends StatefulWidget {
  const _LiveBadge();

  @override
  State<_LiveBadge> createState() => _LiveBadgeState();
}

class _LiveBadgeState extends State<_LiveBadge>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
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
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppTheme.navy.withOpacity(0.8),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.green.withOpacity(0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedBuilder(
            animation: _anim,
            builder: (_, __) => Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                color: AppTheme.green.withOpacity(_anim.value),
                shape: BoxShape.circle,
              ),
            ),
          ),
          const SizedBox(width: 5),
          const Text(
            'LIVE',
            style: TextStyle(
              color: AppTheme.green,
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}

class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1E3A5F).withOpacity(0.4)
      ..strokeWidth = 0.5;

    const step = 30.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(_) => false;
}
