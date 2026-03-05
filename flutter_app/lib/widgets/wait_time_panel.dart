import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/vehicle_assignment.dart';
import '../models/vehicle.dart';
import '../theme/app_theme.dart';

class WaitTimePanel extends StatelessWidget {
  final List<({VehicleAssignment assignment, Vehicle? vehicle})>
      activeAssignments;

  const WaitTimePanel({
    super.key,
    required this.activeAssignments,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ── Header ────────────────────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            children: [
              const Icon(
                Icons.timer_rounded,
                color: AppTheme.accent,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Estimated Wait Times',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              const Spacer(),
              Text(
                '${activeAssignments.length} active',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppTheme.textMuted,
                    ),
              ),
            ],
          ),
        ),

        // ── Content ───────────────────────────────────────────────────────
        Expanded(
          child: activeAssignments.isEmpty
              ? _buildEmpty(context)
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  itemCount: activeAssignments.length,
                  itemBuilder: (_, i) {
                    final entry = activeAssignments[i];
                    return _WaitTimeCard(
                      assignment: entry.assignment,
                      vehicle: entry.vehicle,
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildEmpty(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppTheme.green.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(
                color: AppTheme.green.withOpacity(0.3),
              ),
            ),
            child: const Icon(
              Icons.check_circle_outline_rounded,
              color: AppTheme.green,
              size: 32,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'All vehicles available!',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: AppTheme.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'No active assignments at the moment.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textMuted,
                ),
          ),
        ],
      ),
    );
  }
}

class _WaitTimeCard extends StatefulWidget {
  final VehicleAssignment assignment;
  final Vehicle? vehicle;

  const _WaitTimeCard({required this.assignment, this.vehicle});

  @override
  State<_WaitTimeCard> createState() => _WaitTimeCardState();
}

class _WaitTimeCardState extends State<_WaitTimeCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    if (widget.assignment.isDueSoon) {
      _ctrl.repeat(reverse: true);
    }
    _anim = Tween(begin: 0.5, end: 1.0).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final a = widget.assignment;
    final v = widget.vehicle;
    final isDueSoon = a.isDueSoon;
    final isOverdue = a.isOverdue;

    final accentColor = isOverdue
        ? AppTheme.red
        : isDueSoon
            ? AppTheme.amber
            : AppTheme.accent;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: AppTheme.glassCard(
        borderColor: accentColor.withOpacity(isDueSoon ? 0.4 : 0.15),
      ),
      child: Column(
        children: [
          // ── Top Row ─────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Row(
              children: [
                // Color accent stripe
                Container(
                  width: 4,
                  height: 44,
                  decoration: BoxDecoration(
                    color: accentColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 12),

                // Vehicle info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        v?.name ?? 'Vehicle',
                        style: Theme.of(context)
                            .textTheme
                            .bodyLarge
                            ?.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                            ),
                      ),
                      Text(
                        v?.plateNumber ?? '',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.textMuted,
                              fontFamily: 'monospace',
                            ),
                      ),
                    ],
                  ),
                ),

                // Wait time
                AnimatedBuilder(
                  animation: _anim,
                  builder: (_, __) => Opacity(
                    opacity: isDueSoon ? _anim.value : 1.0,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          isOverdue ? 'OVERDUE' : a.waitTimeLabel,
                          style: TextStyle(
                            color: accentColor,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          'est. return',
                          style: TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Details Row ──────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(30, 0, 14, 12),
            child: Row(
              children: [
                _DetailItem(
                  icon: Icons.person_outline_rounded,
                  label: a.assignedTo,
                ),
                if (a.department != null) ...[
                  const SizedBox(width: 14),
                  _DetailItem(
                    icon: Icons.business_rounded,
                    label: a.department!,
                  ),
                ],
                if (a.purpose != null) ...[
                  const SizedBox(width: 14),
                  Expanded(
                    child: _DetailItem(
                      icon: Icons.place_outlined,
                      label: a.purpose!,
                    ),
                  ),
                ],
                const Spacer(),
                if (a.estimatedEnd != null)
                  _DetailItem(
                    icon: Icons.schedule_rounded,
                    label: DateFormat('HH:mm').format(a.estimatedEnd!),
                    color: accentColor,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;

  const _DetailItem({
    required this.icon,
    required this.label,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          color: color ?? AppTheme.textMuted,
          size: 12,
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            color: color ?? AppTheme.textSecondary,
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }
}
