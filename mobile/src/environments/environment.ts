import { Capacitor } from '@capacitor/core';

export const environment = {
  apiUrl: Capacitor.getPlatform() === 'android' ? 'http://192.168.1.47:8000/api' : 'http://127.0.0.1:8000/api',
  production: false
};
