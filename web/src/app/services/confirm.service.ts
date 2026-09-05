import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslationService } from './translation.service';

export interface ConfirmDialogData {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private translationService = inject(TranslationService, { optional: true });

  private confirmSubject = new BehaviorSubject<ConfirmDialogData>({
    show: false,
    title: '',
    message: '',
    confirmText: 'ஆம், தொடர்க',
    cancelText: 'ரத்து',
    type: 'danger',
    icon: 'bi bi-exclamation-triangle-fill'
  });

  confirm$ = this.confirmSubject.asObservable();
  private resolver: ((value: boolean) => void) | null = null;

  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'primary';
    icon?: string;
  }): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      const type = options.type || 'danger';
      const icon = options.icon || (
        type === 'danger' ? 'bi bi-trash3-fill' :
        type === 'warning' ? 'bi bi-exclamation-triangle-fill' :
        'bi bi-question-circle-fill'
      );

      const isTa = this.translationService ? this.translationService.currentLanguage() === 'ta' : true;

      let confirmText = options.confirmText;
      let cancelText = options.cancelText;

      if (!confirmText) {
        confirmText = isTa ? 'ஆம், தொடர்க' : 'Yes, Continue';
      } else if (confirmText.includes('(') && confirmText.includes(')')) {
        if (isTa) {
          confirmText = confirmText.replace(/\s*\([A-Za-z\s0-9#\-_:]+\)/g, '').trim();
        } else {
          const match = confirmText.match(/\(([A-Za-z\s0-9#\-_:]+)\)/);
          confirmText = match && match[1] ? match[1].trim() : confirmText;
        }
      }

      if (!cancelText) {
        cancelText = isTa ? 'ரத்து' : 'Cancel';
      } else if (cancelText.includes('(') && cancelText.includes(')')) {
        if (isTa) {
          cancelText = cancelText.replace(/\s*\([A-Za-z\s0-9#\-_:]+\)/g, '').trim();
        } else {
          const match = cancelText.match(/\(([A-Za-z\s0-9#\-_:]+)\)/);
          cancelText = match && match[1] ? match[1].trim() : cancelText;
        }
      }

      this.confirmSubject.next({
        show: true,
        title: options.title,
        message: options.message,
        confirmText,
        cancelText,
        type,
        icon
      });
    });
  }

  handleDecision(decision: boolean): void {
    const current = this.confirmSubject.getValue();
    this.confirmSubject.next({ ...current, show: false });
    if (this.resolver) {
      this.resolver(decision);
      this.resolver = null;
    }
  }
}
