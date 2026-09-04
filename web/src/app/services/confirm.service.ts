import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private confirmSubject = new BehaviorSubject<ConfirmDialogData>({
    show: false,
    title: '',
    message: '',
    confirmText: 'ஆம் (Yes)',
    cancelText: 'ரத்து (Cancel)',
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

      this.confirmSubject.next({
        show: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'ஆம், தொடர்க',
        cancelText: options.cancelText || 'ரத்து',
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
