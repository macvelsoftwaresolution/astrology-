import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastCtrl: ToastController) {}

  async show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 3500
  ) {
    try {
      const toast = await this.toastCtrl.create({
        message,
        duration,
        position: 'bottom',
        cssClass: `luxury-app-toast toast-${type}`,
        buttons: [
          {
            text: '✕',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
    } catch {
      // Fallback if toast controller is not ready
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  success(msg: string) {
    return this.show(msg, 'success');
  }

  error(msg: string) {
    return this.show(msg, 'error');
  }

  warning(msg: string) {
    return this.show(msg, 'warning');
  }

  info(msg: string) {
    return this.show(msg, 'info');
  }
}
