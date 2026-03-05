import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vedanta.fleetpulse',
  appName: 'Vedanta FleetPulse',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0c1a3a',
      showSpinner: true,
      spinnerColor: '#00a650',
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#0c1a3a',
      style: 'LIGHT',
    },
  },
  server: {
    url: 'http://127.0.0.1:3000',
    cleartext: true,
  },
};

export default config;
