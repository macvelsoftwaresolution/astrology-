import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  private debounceTimer: any = null;
  private maxTimeoutTimer: any = null;
  readonly isLoading = signal<boolean>(false);

  show(): void {
    if (typeof window === 'undefined') return;
    this.activeRequests++;

    if (!this.debounceTimer && !this.isLoading()) {
      this.debounceTimer = setTimeout(() => {
        if (this.activeRequests > 0) {
          this.isLoading.set(true);
        }
      }, 150);
    }

    clearTimeout(this.maxTimeoutTimer);
    this.maxTimeoutTimer = setTimeout(() => {
      this.forceHide();
    }, 1500);
  }

  hide(): void {
    if (typeof window === 'undefined') return;
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this.clearTimers();
      setTimeout(() => {
        if (this.activeRequests === 0) {
          this.isLoading.set(false);
        }
      }, 0);
    }
  }

  forceHide(): void {
    this.activeRequests = 0;
    this.clearTimers();
    setTimeout(() => {
      this.isLoading.set(false);
    }, 0);
  }

  private clearTimers(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.maxTimeoutTimer) {
      clearTimeout(this.maxTimeoutTimer);
      this.maxTimeoutTimer = null;
    }
  }
}
