import { Capacitor } from '@capacitor/core';

export const environment = {
  apiUrl: Capacitor.getPlatform() === 'android' ? 'http://192.168.1.47:8000/api' : 'https://api.sriaarudhraaastro.com/api',
  pathUrl: Capacitor.getPlatform() === 'android' ? 'http://192.168.1.47:8000' : 'https://api.sriaarudhraaastro.com',
  production: false
};
