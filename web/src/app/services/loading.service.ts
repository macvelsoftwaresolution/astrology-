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
    }, 800);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      this.clearTimers();
      this.isLoading.set(false);
    }
  }

  forceHide(): void {
    this.activeRequests = 0;
    this.clearTimers();
    this.isLoading.set(false);
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
