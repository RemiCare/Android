import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Name: Senior Care AppPackage ID: com.example.seniorcare',
  webDir: 'build',
  server: {
    url: 'http://192.168.1.102:3001',
    cleartext: true
  }
};

export default config;
