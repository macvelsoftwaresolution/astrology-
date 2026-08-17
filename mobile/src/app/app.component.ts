import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { NavController } from '@ionic/angular';
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
    private backButtonService: BackButtonService
  ) {}

  async ngOnInit() {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#FAF6E8' });
    } catch (e) {
      console.log('StatusBar not available in browser', e);
    }

    App.addListener('backButton', ({ canGoBack }) => {
      this.ngZone.run(() => {
        // Try page-specific back handlers first
        const handled = this.backButtonService.handleBack();
        if (handled) {
          return;
        }

        // Standard history back navigation when no custom overlay page handler intercepted it
        if (canGoBack) {
          this.navCtrl.back();
        } else {
          App.exitApp();
        }
      });
    });
  }
}
