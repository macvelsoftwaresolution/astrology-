import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { registerPlugin } from '@capacitor/core';
import { filter } from 'rxjs/operators';

export interface SecureScreenPluginInterface {
  enable(): Promise<void>;
  disable(): Promise<void>;
}

const SecureScreen = registerPlugin<SecureScreenPluginInterface>('SecureScreenPlugin');

@Injectable({
  providedIn: 'root'
})
export class SecureScreenService {
  private isSecured = false;

  constructor(private router: Router) {}

  /**
   * Initializes automatic route-based screen security.
   * - Enables FLAG_SECURE on LMS / Learn pages (protects lessons, videos, curriculum, exams).
   * - Disables FLAG_SECURE on Astrology pages (allows taking screenshots of horoscope, marriage matching, etc.).
   */
  initRouteProtection() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.handleRouteChange(event.urlAfterRedirects || event.url);
    });

    // Check current URL immediately upon initialization
    this.handleRouteChange(this.router.url);
  }

  private handleRouteChange(url: string) {
    // Only lock down education/LMS routes
    const isLearnRoute = url.startsWith('/learn');
    if (isLearnRoute) {
      this.enableProtection();
    } else {
      this.disableProtection();
    }
  }

  async enableProtection() {
    if (this.isSecured) return;
    try {
      await SecureScreen.enable();
      this.isSecured = true;
    } catch (e) {
      // Graceful fallback on web/browser platform
    }
  }

  async disableProtection() {
    if (!this.isSecured) return;
    try {
      await SecureScreen.disable();
      this.isSecured = false;
    } catch (e) {
      // Graceful fallback on web/browser platform
    }
  }
}
