import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { BackButtonService } from '../../services/back-button.service';

@Component({
  selector: 'app-jathagam',
  standalone: true,
  imports: [RouterOutlet, IonContent, IonHeader, IonToolbar],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <div style="display: flex; align-items: center; padding: 0 8px;">
          <button type="button" (click)="goBack()" style="background: transparent; border: none; color: #ffd700; font-size: 22px; cursor: pointer; padding: 6px 10px; display: flex; align-items: center;">
            ←
          </button>
          <span class="brand" style="font-size: 18px; margin-left: 4px;">✨ ஜாதகம்</span>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="jathagam-content">
      <!-- Sub-navigation cards -->
      <div class="sub-nav-grid">
        <div class="sub-card" [class.active]="activeTab === 'rasi-palan'" (click)="navigate('rasi-palan')">
          <span class="card-icon">🌟</span>
          <span class="card-title">ராசி பலன்</span>
          <span class="card-sub">Rasi Palan</span>
        </div>
        <div class="sub-card" [class.active]="activeTab === 'matching'" (click)="navigate('matching')">
          <span class="card-icon">💑</span>
          <span class="card-title">திருமண பொருத்தம்</span>
          <span class="card-sub">Marriage Matching</span>
        </div>
        <div class="sub-card" [class.active]="activeTab === 'my-jathagam'" (click)="navigate('my-jathagam')">
          <span class="card-icon">📜</span>
          <span class="card-title">என் ஜாதகம்</span>
          <span class="card-sub">My Birth Chart</span>
        </div>
        <div class="sub-card" [class.active]="activeTab === 'para-jathagam'" (click)="navigate('para-jathagam')">
          <span class="card-icon">🔭</span>
          <span class="card-title">பரஜாதகம்</span>
          <span class="card-sub">Para Jathagam</span>
        </div>
        <div class="sub-card" [class.active]="activeTab === 'vastu-kanitha'" (click)="navigate('vastu-kanitha')">
          <span class="card-icon">🏠</span>
          <span class="card-title">வாஸ்து & கணிதம்</span>
          <span class="card-sub">Vastu & Numerology</span>
        </div>
      </div>

      <router-outlet></router-outlet>
    </ion-content>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    ion-toolbar { --background: #0d0822; }
    .brand { color: #ffd700; font-weight: 700; font-size: 18px; }
    .jathagam-content { --background: #090614; }

    .sub-nav-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      padding: 16px;
    }

    .sub-card {
      background: #160f33;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 14px 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .sub-card.active, .sub-card:active {
      background: rgba(212, 175, 55, 0.2);
      border-color: rgba(212, 175, 55, 0.5);
      transform: scale(0.97);
    }

    .card-icon { font-size: 24px; }
    .card-title { font-size: 11px; color: #ffd700; font-weight: 700; }
    .card-sub { font-size: 9px; color: #8a8ab0; }
  `]
})
export class JathagamPage implements OnDestroy {
  activeTab = 'rasi-palan';

  constructor(private router: Router, private backButtonService: BackButtonService) {}

  ionViewDidEnter() {
    this.backButtonService.registerHandler(this.customBackHandler);
  }

  ionViewWillLeave() {
    this.backButtonService.unregisterHandler(this.customBackHandler);
  }

  ngOnDestroy() {
    this.backButtonService.unregisterHandler(this.customBackHandler);
  }

  customBackHandler = () => {
    this.goBack();
    return true;
  };

  goBack() {
    this.router.navigate(['/home']);
  }

  navigate(tab: string) {
    this.activeTab = tab;
    this.router.navigate(['/jathagam', tab]);
  }
}
