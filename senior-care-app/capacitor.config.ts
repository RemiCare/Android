import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Senior Care App',
  webDir: 'build',
  server: {
    url: 'http://192.168.1.102:3001',
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
