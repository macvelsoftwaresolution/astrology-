import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { NavController, Platform, IonRouterOutlet } from '@ionic/angular';
import { BackButtonService } from './services/back-button.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private ngZone: NgZone,
    private router: Router,
    private navCtrl: NavController,
    private platform: Platform,
    private backButtonService: BackButtonService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
        this.ngZone.run(() => {
          // Try page-specific back handlers first
          const handled = this.backButtonService.handleBack();
          if (handled) {
            return;
          }

          // If we are at root paths, exit
          if (this.router.url === '/home' || this.router.url === '/welcome') {
            App.exitApp();
          } else {
            // Standard history back navigation
            this.navCtrl.back();
          }
        });
      });
    });
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
