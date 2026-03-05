import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class AppHeader extends StatelessWidget {
  final Future<void> Function() onRefresh;
  final bool isLoading;
  final bool isSharingLocation;
  final VoidCallback? onToggleLocation;

  const AppHeader({
    super.key,
    required this.onRefresh,
    this.isLoading = false,
    this.isSharingLocation = false,
    this.onToggleLocation,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: BoxDecoration(
        color: AppTheme.navyLight.withOpacity(0.8),
        border: const Border(
          bottom: BorderSide(color: AppTheme.navyBorder, width: 1),
        ),
      ),
      child: Row(
        children: [
          // ── Logo Left ─────────────────────────────────────────────────
          Expanded(
            child: Row(
              children: [
                // Vedanta icon / logo placeholder
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.location_on_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'FleetPulse',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: AppTheme.textPrimary,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.3,
                          ),
                    ),
                    Text(
                      'GPS Vehicle Tracking',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textMuted,
                            fontSize: 10,
                          ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── Right Actions ─────────────────────────────────────────────
          Row(
            children: [
              // Live indicator
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppTheme.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: AppTheme.green.withOpacity(0.3), width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _PulsingDot(),
                    const SizedBox(width: 5),
                    Text(
                      'Live',
                      style: TextStyle(
                        color: AppTheme.green,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              // Location Sharing Toggle
              GestureDetector(
                onTap: onToggleLocation,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: isSharingLocation 
                       ? AppTheme.green.withOpacity(0.15) 
                       : AppTheme.navyCard,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSharingLocation 
                         ? AppTheme.green.withOpacity(0.5) 
                         : AppTheme.navyBorder,
                    ),
                  ),
                  child: Icon(
                    isSharingLocation ? Icons.gps_fixed_rounded : Icons.gps_not_fixed_rounded,
                    color: isSharingLocation ? AppTheme.green : AppTheme.textMuted,
                    size: 18,
                  ),
                ),
              ),

              const SizedBox(width: 8),

              // Refresh button
              GestureDetector(
                onTap: isLoading ? null : onRefresh,
                child: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppTheme.navyCard,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppTheme.navyBorder),
                  ),
                  child: isLoading
                      ? const Center(
                          child: SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppTheme.accent,
                            ),
                          ),
                        )
                      : const Icon(
                          Icons.refresh_rounded,
                          color: AppTheme.textSecondary,
                          size: 18,
                        ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
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
        width: 6,
        height: 6,
        decoration: BoxDecoration(
          color: AppTheme.green.withOpacity(_anim.value),
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
