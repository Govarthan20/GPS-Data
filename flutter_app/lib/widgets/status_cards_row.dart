import 'package:flutter/material.dart';

import '../models/vehicle.dart';
import '../theme/app_theme.dart';

class StatusCardsRow extends StatelessWidget {
  final List<Vehicle> vehicles;

  const StatusCardsRow({super.key, required this.vehicles});

  @override
  Widget build(BuildContext context) {
    final counts = <String, int>{
      'available': 0,
      'in_use': 0,
      'maintenance': 0,
      'offline': 0,
    };

    for (final v in vehicles) {
      counts[v.status] = (counts[v.status] ?? 0) + 1;
    }

    final cards = [
      _CardConfig(
        key: 'available',
        label: 'Available',
        icon: Icons.directions_car_rounded,
      ),
      _CardConfig(
        key: 'in_use',
        label: 'In Use',
        icon: Icons.local_shipping_rounded,
      ),
      _CardConfig(
        key: 'maintenance',
        label: 'Maintenance',
        icon: Icons.build_rounded,
      ),
      _CardConfig(
        key: 'offline',
        label: 'Offline',
        icon: Icons.wifi_off_rounded,
      ),
    ];

    return Row(
      children: cards
          .map(
            (c) => Expanded(
              child: _StatusCard(
                config: c,
                count: counts[c.key] ?? 0,
              ),
            ),
          )
          .toList(),
    );
  }
}

class _CardConfig {
  final String key;
  final String label;
  final IconData icon;
  const _CardConfig({
    required this.key,
    required this.label,
    required this.icon,
  });
}

class _StatusCard extends StatelessWidget {
  final _CardConfig config;
  final int count;

  const _StatusCard({required this.config, required this.count});

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.statusColor(config.key);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.fromLTRB(10, 12, 10, 10),
      decoration: BoxDecoration(
        color: AppTheme.navyCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.navyBorder, width: 1),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(config.icon, color: color, size: 15),
          ),
          const SizedBox(height: 8),
          // Count
          Text(
            '$count',
            style: TextStyle(
              color: AppTheme.textPrimary,
              fontSize: 22,
              fontWeight: FontWeight.w700,
              height: 1,
            ),
          ),
          const SizedBox(height: 2),
          // Label
          Text(
            config.label,
            style: TextStyle(
              color: AppTheme.textMuted,
              fontSize: 9,
              fontWeight: FontWeight.w500,
            ),
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          // Color accent bar at bottom
          Container(
            height: 3,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ],
      ),
    );
  }
}
