import { Capacitor } from '@capacitor/core';

export const environment = {
  apiUrl: Capacitor.getPlatform() === 'android' ? 'http://192.168.1.47:8000/api' : 'http://localhost:8000/api',
  pathUrl: Capacitor.getPlatform() === 'android' ? 'http://192.168.1.47:8000' : 'http://localhost:8000',
  production: false
};
