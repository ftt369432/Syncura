import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'health.syncura.app',
  appName: 'Syncura',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#022c22',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#022c22',
    },
  },
};

export default config;
