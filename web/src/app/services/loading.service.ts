import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  private maxTimeoutTimer: any = null;
  readonly isLoading = signal<boolean>(false);

  show(): void {
    if (typeof window === 'undefined') return;
    this.activeRequests++;

    if (!this.isLoading()) {
      this.isLoading.set(true);
    }

    // Safety timeout (15s) only in case a request hangs indefinitely
    clearTimeout(this.maxTimeoutTimer);
    this.maxTimeoutTimer = setTimeout(() => {
      this.forceHide();
    }, 15000);
  }

  hide(): void {
    if (typeof window === 'undefined') return;
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      if (this.maxTimeoutTimer) {
        clearTimeout(this.maxTimeoutTimer);
        this.maxTimeoutTimer = null;
      }
      setTimeout(() => {
        if (this.activeRequests === 0) {
          this.isLoading.set(false);
        }
      }, 0);
    }
  }

  forceHide(): void {
    this.activeRequests = 0;
    if (this.maxTimeoutTimer) {
      clearTimeout(this.maxTimeoutTimer);
      this.maxTimeoutTimer = null;
    }
    setTimeout(() => {
      this.isLoading.set(false);
    }, 0);
  }
}
