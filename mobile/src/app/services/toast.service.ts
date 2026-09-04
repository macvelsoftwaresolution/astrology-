import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private translationService = inject(TranslationService, { optional: true });

  constructor(private toastCtrl: ToastController) {}

  async show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 3500
  ) {
    try {
      const isTa = this.translationService ? this.translationService.currentLanguage() === 'ta' : true;
      let cleanMessage = message || '';

      // Clean mixed language in brackets
      if (this.translationService) {
        cleanMessage = this.translationService.cleanText(cleanMessage, isTa ? 'ta' : 'en');
      }

      const toast = await this.toastCtrl.create({
        message: cleanMessage,
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
