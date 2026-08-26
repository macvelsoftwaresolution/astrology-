import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastData {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastData>({
    show: false,
    message: '',
    type: 'success',
    title: ''
  });

  toast$ = this.toastSubject.asObservable();
  private timeoutRef: any;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title: string = '', duration = 3800): void {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    const defaultTitle = title || (
      type === 'success' ? 'வெற்றி (Success)' :
      type === 'error' ? 'பிழை (Error)' :
      type === 'warning' ? 'எச்சரிக்கை (Warning)' : 'தகவல் (Info)'
    );

    this.toastSubject.next({
      show: true,
      message,
      type,
      title: defaultTitle,
      duration
    });

    this.timeoutRef = setTimeout(() => {
      this.hide();
    }, duration);
  }

  success(message: string, title = 'வெற்றி (Success)'): void {
    this.show(message, 'success', title);
  }

  error(message: string, title = 'பிழை (Error)'): void {
    this.show(message, 'error', title);
  }

  info(message: string, title = 'தகவல் (Info)'): void {
    this.show(message, 'info', title);
  }

  warning(message: string, title = 'எச்சரிக்கை (Warning)'): void {
    this.show(message, 'warning', title);
  }

  hide(): void {
    const curr = this.toastSubject.getValue();
    this.toastSubject.next({ ...curr, show: false });
  }
}
