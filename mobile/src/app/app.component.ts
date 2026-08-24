import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { NavController, Platform } from '@ionic/angular';
import { BackButtonService } from './services/back-button.service';
import { ExitModalService } from './services/exit-modal.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  isExitModalOpen = false;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private navCtrl: NavController,
    private platform: Platform,
    private backButtonService: BackButtonService,
    public exitModalService: ExitModalService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.exitModalService.isOpen$.subscribe(open => {
      this.isExitModalOpen = open;
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        this.ngZone.run(() => {
          if (this.isExitModalOpen) {
            this.cancelExit();
            return;
          }

          const currentUrl = this.router.url;
          if (currentUrl === '/home' || currentUrl.startsWith('/home?') || currentUrl === '/learn' || currentUrl.startsWith('/learn?') || currentUrl === '/welcome') {
            window.history.pushState(null, '', window.location.href);
            const handled = this.backButtonService.handleBack();
            if (!handled) {
              this.exitModalService.open();
            }
          }
        });
      });
    }

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
        this.ngZone.run(() => {
          // If exit modal is already open, pressing back closes it
          if (this.isExitModalOpen) {
            this.cancelExit();
            return;
          }

          // Try page-specific back handlers first
          const handled = this.backButtonService.handleBack();
          if (handled) {
            return;
          }

          // If we are at root path (/home, /learn or /welcome), show exit confirmation dialog
          if (this.router.url === '/home' || this.router.url.startsWith('/home?') || this.router.url === '/learn' || this.router.url.startsWith('/learn?') || this.router.url === '/welcome') {
            this.exitModalService.open();
          } else {
            // Standard history back navigation
            this.navCtrl.back();
          }
        });
      });
    });
  }

  cancelExit() {
    this.exitModalService.close();
  }

  confirmExit() {
    this.exitModalService.close();
    if (this.platform.is('capacitor')) {
      App.exitApp();
    }
  }

  async ngOnInit() {
    if (this.platform.is('capacitor')) {
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#FAF6E8' });
      } catch (e) {
        console.log('StatusBar not available in browser', e);
      }
    }
  }
}
