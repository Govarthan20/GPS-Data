# FleetPulse — Flutter App

> **Vedanta FleetPulse** mobile app built with Flutter, connecting to the same **NeonDB (PostgreSQL)** backend as the existing Next.js web app.

---

## 📱 Features

| Feature | Description |
|---|---|
| 🗺️ **Live Map** | Dark-themed map (CartoDB Dark Matter) with color-coded vehicle markers |
| 🚗 **Vehicle List** | Searchable + filterable list with speed, fuel, driver info |
| ⏱️ **Wait Times** | Active assignment panel with countdown timers |
| 📊 **Dashboard** | Status cards (Available/In Use/Maintenance/Offline), quick stats, map preview |
| 🔴 **Live Updates** | Polls API every 5–10 seconds for real-time GPS data |
| 🌙 **Dark Theme** | Matches the navy/blue design of the web dashboard |

---

## 🏗️ Project Structure

```
flutter_app/
├── lib/
│   ├── main.dart                    # Entry point
│   ├── theme/
│   │   └── app_theme.dart          # Color palette, dark theme, glassmorphism
│   ├── models/
│   │   ├── vehicle.dart            # Vehicle data model
│   │   ├── gps_position.dart       # GPS position model (matches DB view)
│   │   └── vehicle_assignment.dart # Assignment model with wait time helpers
│   ├── services/
│   │   └── api_service.dart        # HTTP API calls to Next.js backend
│   ├── providers/
│   │   └── fleet_provider.dart     # State management (Provider)
│   ├── screens/
│   │   ├── dashboard_screen.dart   # Main screen with bottom nav
│   │   └── map_screen.dart         # GPS map with flutter_map
│   └── widgets/
│       ├── app_header.dart         # Top header with logo + refresh
│       ├── status_cards_row.dart   # 4 status count cards
│       ├── vehicle_list_panel.dart # Searchable vehicle list
│       └── wait_time_panel.dart    # Wait time cards
├── android/                         # Android platform files
├── pubspec.yaml                    # Dependencies
└── README.md
```

---

## ⚙️ Setup & Running

### Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install/windows) ≥ 3.10.0
- Android SDK / Android Studio (for Android)
- Xcode (for iOS, macOS only)
- The **Next.js backend** running (`npm run dev` in the GPS-Data folder)

### 1. Install Flutter

Download and install Flutter from https://docs.flutter.dev/get-started/install/windows

Add Flutter to PATH:
```powershell
$env:PATH += ";C:\flutter\bin"
```

### 2. Configure the API URL

Edit `lib/services/api_service.dart` and update `_baseUrl`:

```dart
// For Android Emulator (accesses the host machine):
static const String _baseUrl = 'http://10.0.2.2:3000';

// For physical device on same WiFi (replace with your PC's LAN IP):
static const String _baseUrl = 'http://192.168.x.x:3000';

// For iOS Simulator:
static const String _baseUrl = 'http://localhost:3000';
```

### 3. Install Dependencies

```powershell
cd C:\ReactWorkSpace\GPS-Data\flutter_app
flutter pub get
```

### 4. Run the App

```powershell
# Start the backend first (in GPS-Data folder)
# Terminal 1:
cd C:\ReactWorkSpace\GPS-Data
npm run dev

# Terminal 2: Run Flutter
cd C:\ReactWorkSpace\GPS-Data\flutter_app
flutter run
```

---

## 🗄️ Data Sources

All data comes from the same **NeonDB PostgreSQL** database:

| Data | API Endpoint | Refresh Rate |
|---|---|---|
| Vehicles | `GET /api/data?type=vehicles` | Every 10s |
| GPS Positions | `GET /api/data?type=positions` | Every 5s |
| Assignments | `GET /api/data?type=assignments` | Every 15s |

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `flutter_map` | OpenStreetMap-based maps |
| `latlong2` | Lat/Lng coordinate types |
| `provider` | State management |
| `http` | HTTP API calls |
| `google_fonts` | Inter font (matches web app) |
| `intl` | Date/time formatting |

---

## 🌐 API Connection

The Flutter app connects to the **existing Next.js backend** — no new backend is needed. The backend must be running and accessible from the device/emulator.

> **Note:** The `.env` file in the root `GPS-Data` folder contains the NeonDB connection string — this is only used by the Next.js server, not by Flutter directly.

---

## 🎨 Design

The Flutter app closely mirrors the web dashboard:
- **Navy dark theme** (`#0C1A3A` background)
- **Glassmorphism cards** with subtle borders
- **CartoDB Dark Matter** map tiles (same as web)
- **Status colors**: Green (available), Blue (in use), Amber (maintenance), Red (offline)
- **Animated elements**: Pulsing live dot, overdue assignment blink

---

## 🚀 Building for Release (Android APK)

```powershell
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```
