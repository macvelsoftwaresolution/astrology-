import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {
  private handlers: (() => boolean)[] = [];

  registerHandler(handler: () => boolean) {
    this.handlers.push(handler);
  }

  unregisterHandler(handler: () => boolean) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  handleBack(): boolean {
    for (let i = this.handlers.length - 1; i >= 0; i--) {
      const handled = this.handlers[i]();
      if (handled) {
        return true;
      }
    }
    return false;
  }
}
