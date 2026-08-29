import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  private maxTimeoutTimer: any = null;
  public isLoading$ = new BehaviorSubject<boolean>(false);

  show(): void {
    this.activeRequests++;

    if (!this.isLoading$.value) {
      this.isLoading$.next(true);
    }

    // Safety timeout (15s) only in case a request hangs indefinitely
    clearTimeout(this.maxTimeoutTimer);
    this.maxTimeoutTimer = setTimeout(() => {
      this.forceHide();
    }, 15000);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      if (this.maxTimeoutTimer) {
        clearTimeout(this.maxTimeoutTimer);
        this.maxTimeoutTimer = null;
      }
      this.isLoading$.next(false);
    }
  }

  forceHide(): void {
    this.activeRequests = 0;
    if (this.maxTimeoutTimer) {
      clearTimeout(this.maxTimeoutTimer);
      this.maxTimeoutTimer = null;
    }
    this.isLoading$.next(false);
  }
}
