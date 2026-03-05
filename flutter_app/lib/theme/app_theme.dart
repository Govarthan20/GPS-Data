import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ─── Color Palette ───────────────────────────────────────────────────
  static const Color navy = Color(0xFF0C1A3A);
  static const Color navyLight = Color(0xFF112347);
  static const Color navyCard = Color(0xFF0F2040);
  static const Color navyBorder = Color(0xFF1E3A5F);
  static const Color accent = Color(0xFF2563EB);
  static const Color accentGlow = Color(0x442563EB);
  static const Color green = Color(0xFF00A650);
  static const Color greenGlow = Color(0x4400A650);
  static const Color amber = Color(0xFFE6A817);
  static const Color amberGlow = Color(0x44E6A817);
  static const Color red = Color(0xFFDC2626);
  static const Color redGlow = Color(0x44DC2626);
  static const Color textPrimary = Color(0xFFE2E8F0);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // ─── Status Colors ───────────────────────────────────────────────────
  static Color statusColor(String status) {
    switch (status) {
      case 'available':
        return green;
      case 'in_use':
        return accent;
      case 'maintenance':
        return amber;
      case 'offline':
        return red;
      default:
        return textMuted;
    }
  }

  static Color statusGlow(String status) {
    switch (status) {
      case 'available':
        return greenGlow;
      case 'in_use':
        return accentGlow;
      case 'maintenance':
        return amberGlow;
      case 'offline':
        return redGlow;
      default:
        return Colors.transparent;
    }
  }

  static String statusLabel(String status) {
    switch (status) {
      case 'available':
        return 'Available';
      case 'in_use':
        return 'In Use';
      case 'maintenance':
        return 'Maintenance';
      case 'offline':
        return 'Offline';
      default:
        return status;
    }
  }

  // ─── Dark Theme ──────────────────────────────────────────────────────
  static ThemeData get darkTheme {
    final base = ThemeData.dark(useMaterial3: true);
    final textTheme = GoogleFonts.interTextTheme(base.textTheme).copyWith(
      displayLarge: GoogleFonts.inter(
        color: textPrimary,
        fontSize: 32,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      ),
      displayMedium: GoogleFonts.inter(
        color: textPrimary,
        fontSize: 24,
        fontWeight: FontWeight.w700,
      ),
      titleLarge: GoogleFonts.inter(
        color: textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      ),
      titleMedium: GoogleFonts.inter(
        color: textPrimary,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: GoogleFonts.inter(
        color: textPrimary,
        fontSize: 14,
        fontWeight: FontWeight.w400,
      ),
      bodyMedium: GoogleFonts.inter(
        color: textSecondary,
        fontSize: 13,
        fontWeight: FontWeight.w400,
      ),
      bodySmall: GoogleFonts.inter(
        color: textMuted,
        fontSize: 11,
        fontWeight: FontWeight.w400,
      ),
      labelLarge: GoogleFonts.inter(
        color: textPrimary,
        fontSize: 12,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
      ),
    );

    return base.copyWith(
      textTheme: textTheme,
      scaffoldBackgroundColor: navy,
      colorScheme: const ColorScheme.dark(
        surface: navyCard,
        primary: accent,
        secondary: green,
        error: red,
        onSurface: textPrimary,
        onPrimary: Colors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        titleTextStyle: GoogleFonts.inter(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
        iconTheme: const IconThemeData(color: textPrimary),
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
        ),
      ),
      cardTheme: CardTheme(
        color: navyCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: navyBorder, width: 1),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: navyLight,
        indicatorColor: accentGlow,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.inter(
              color: accent,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            );
          }
          return GoogleFonts.inter(
            color: textMuted,
            fontSize: 11,
            fontWeight: FontWeight.w400,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: accent);
          }
          return const IconThemeData(color: textMuted);
        }),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: navyCard,
        labelStyle: GoogleFonts.inter(color: textSecondary, fontSize: 12),
        side: const BorderSide(color: navyBorder),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      dividerTheme: const DividerThemeData(
        color: navyBorder,
        thickness: 1,
        space: 1,
      ),
    );
  }

  // ─── Glassmorphism Card Decoration ──────────────────────────────────
  static BoxDecoration glassCard({
    Color? borderColor,
    double borderRadius = 16,
    double borderWidth = 1,
  }) {
    return BoxDecoration(
      color: navyCard.withOpacity(0.85),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: borderColor ?? navyBorder,
        width: borderWidth,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.3),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ],
    );
  }

  // ─── Gradient Background ─────────────────────────────────────────────
  static BoxDecoration get gradientBackground => const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0A1628),
            Color(0xFF0C1A3A),
            Color(0xFF091525),
          ],
          stops: [0.0, 0.5, 1.0],
        ),
      );
}
