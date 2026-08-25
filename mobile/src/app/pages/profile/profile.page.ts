import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BackButtonService } from '../../services/back-button.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService, LanguageCode } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { IonContent, IonHeader, IonToolbar, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonSpinner, TranslatePipe],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <div style="display: flex; align-items: center; padding: 0 8px;">
          <button type="button" (click)="goBack()" style="background: transparent; border: none; color: #ffd700; font-size: 22px; cursor: pointer; padding: 6px 10px; display: flex; align-items: center;">
            <i class="bi bi-arrow-left"></i>
          </button>
          <span class="brand" style="font-size: 18px; margin-left: 4px;"><i class="bi bi-person-fill me-1"></i> {{ 'profile.title' | translate }}</span>
          
          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px; padding-right: 8px;">
            <button type="button" (click)="toggleLang()" style="background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.4); color: #ffd700; border-radius: 12px; padding: 4px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
              <i class="bi bi-translate"></i> {{ currentLang === 'ta' ? 'English' : 'தமிழ்' }}
            </button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="profile-content">

      <!-- Profile Hero -->
      <div class="profile-hero">
        <div class="avatar-circle">{{ (userName && userName.charAt(0)) || 'U' }}</div>
        <div class="user-info">
          <h2>{{ userName }}</h2>
          <span class="user-email">{{ userEmail }}</span>
          @if (jathagam?.rasi) {
            <span class="rasi-tag">{{ jathagam.rasi }}</span>
          }
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar">
        @for (t of tabs; track t.key) {
          <button [class.active]="activeTab === t.key" (click)="activeTab = t.key">
            <i [class]="t.icon" style="font-size: 16px;"></i>
            <span>{{ t.labelKey | translate }}</span>
          </button>
        }
      </div>

      <!-- TAB: PROFILE EDIT -->
      @if (activeTab === 'profile') {
        <div class="tab-content">
          <div class="section-title">
            <h3>{{ 'profile.editTitle' | translate }}</h3>
            <p>{{ 'profile.editSubtitle' | translate }}</p>
          </div>
          <div class="form-card">
            <div class="form-group"><label>{{ 'profile.name' | translate }}</label><input [(ngModel)]="editProfile.name" class="field" [placeholder]="'profile.name' | translate"/></div>
            <div class="form-group"><label>{{ 'profile.phone' | translate }}</label><input type="tel" [(ngModel)]="editProfile.phone" class="field" [placeholder]="'profile.phone' | translate"/></div>
            <div class="form-group"><label>{{ 'profile.address' | translate }}</label><textarea [(ngModel)]="editProfile.address" class="field textarea" [placeholder]="'profile.address' | translate" rows="2"></textarea></div>
            <button class="save-btn" (click)="saveProfile()" [disabled]="savingProfile">
              @if (savingProfile) {
                <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner>
              } @else {
                <span><i class="bi bi-floppy-fill me-1"></i> {{ 'profile.updateBtn' | translate }}</span>
              }
            </button>
            @if (profileMsg) {
              <p [class.success]="profileSuccess" class="msg">{{ profileMsg }}</p>
            }
          </div>

          <!-- Astrology Profile Card -->
          @if (jathagam) {
            <div class="astro-card">
              <h4><i class="bi bi-star-fill text-warning me-1"></i> {{ 'profile.astroTitle' | translate }}</h4>
              <div class="astro-grid">
                <div class="astro-item"><span class="al">{{ 'profile.rasi' | translate }}</span><span class="av gold">{{ jathagam.rasi }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.star' | translate }}</span><span class="av">{{ jathagam.nakshatra || 'N/A' }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.lagnam' | translate }}</span><span class="av">{{ jathagam.lagnam || 'N/A' }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.dob' | translate }}</span><span class="av">{{ jathagam.dob | date:'dd MMM yyyy' }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.tob' | translate }}</span><span class="av">{{ jathagam.tob || 'N/A' }}</span></div>
                <div class="astro-item"><span class="al">{{ 'profile.pob' | translate }}</span><span class="av">{{ jathagam.pob || 'N/A' }}</span></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- TAB: BOOKING HISTORY -->
      @if (activeTab === 'history') {
        <div class="tab-content">
          <div class="section-title"><h3><i class="bi bi-calendar-event me-1"></i> {{ 'profile.historyTitle' | translate }}</h3><p>{{ 'profile.historySubtitle' | translate }}</p></div>
          @if (loadingHistory) {
            <ion-spinner name="crescent" color="warning"></ion-spinner>
          } @else {
            <div>
              @if (bookings.length === 0) {
                <div class="empty-state">
                  <i class="bi bi-journal-text" style="font-size: 32px; color: #8a8ab0;"></i><p>{{ 'profile.noHistory' | translate }}</p>
                </div>
              }
              @for (b of bookings; track b.id) {
                <div class="booking-card">
                  <div class="booking-header">
                    <span class="booking-id">{{ b.id }}</span>
                    <span class="status-pill" [class]="b.status.toLowerCase()">{{ b.status }}</span>
                  </div>
                  <h4>{{ b.service_type }}</h4>
                  <div class="booking-meta">
                    <span>₹{{ b.price }}</span>
                    <span>{{ b.created_at | date:'dd MMM yyyy' }}</span>
                  </div>
                  @if (b.details) {
                    <div>
                      <small class="muted">DOB: {{ b.details.dob || 'N/A' }} | POB: {{ b.details.pob || 'N/A' }}</small>
                    </div>
                  }
                  @if (b.chart_url && b.status === 'Completed') {
                    <a [href]="b.chart_url" target="_blank" class="chart-link"><i class="bi bi-file-earmark-pdf-fill me-1"></i> Chart PDF</a>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB: PAYMENT HISTORY -->
      @if (activeTab === 'payments') {
        <div class="tab-content">
          <div class="section-title"><h3><i class="bi bi-credit-card me-1"></i> {{ 'profile.paymentsTitle' | translate }}</h3><p>{{ 'profile.paymentsSubtitle' | translate }}</p></div>
          @if (loadingPayments) {
            <ion-spinner name="crescent" color="warning"></ion-spinner>
          } @else {
            <div>
              @if (payments.length === 0) {
                <div class="empty-state">
                  <i class="bi bi-credit-card" style="font-size: 32px; color: #8a8ab0;"></i><p>{{ 'profile.noPayments' | translate }}</p>
                </div>
              }
              @for (p of payments; track p.id) {
                <div class="payment-card">
                  <div class="payment-top">
                    <div>
                      <strong>{{ p.order_type | titlecase }}</strong>
                      <div class="muted">{{ p.description || 'Astrology Service' }}</div>
                    </div>
                    <div class="payment-right">
                      <span class="amount">₹{{ p.amount }}</span>
                      <span class="pay-status" [class]="p.status.toLowerCase()">{{ p.status }}</span>
                    </div>
                  </div>
                  <div class="payment-footer">
                    <small class="muted">{{ p.created_at | date:'dd MMM yyyy, hh:mm a' }}</small>
                    @if (p.razorpay_payment_id) {
                      <small class="muted">ID: {{ p.razorpay_payment_id }}</small>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB: NOTIFICATIONS -->
      @if (activeTab === 'notifications') {
        <div class="tab-content">
          <div class="section-title-row">
            <h3><i class="bi bi-bell-fill me-1"></i> {{ 'profile.notifsTitle' | translate }}</h3>
            @if (unreadCount > 0) {
              <button class="mark-all-btn" (click)="markAllRead()">{{ 'profile.markAllRead' | translate }}</button>
            }
          </div>
          @if (loadingNotifs) {
            <ion-spinner name="crescent" color="warning"></ion-spinner>
          } @else {
            <div>
              @if (notifications.length === 0) {
                <div class="empty-state">
                  <i class="bi bi-bell" style="font-size: 32px; color: #8a8ab0;"></i><p>{{ 'profile.noNotifs' | translate }}</p>
                </div>
              }
              @for (n of notifications; track n.id) {
                <div class="notif-card" [class.unread]="!n.is_read" (click)="markRead(n)">
                  <div class="notif-icon"><i [class]="getNotifIconClass(n.type)"></i></div>
                  <div class="notif-body">
                    <strong>{{ n.title }}</strong>
                    <p>{{ n.body }}</p>
                    <small class="muted">{{ n.created_at | date:'dd MMM, hh:mm a' }}</small>
                  </div>
                  @if (!n.is_read) {
                    <div class="unread-dot"></div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- TAB: NOTIFICATION PREFERENCES & LANGUAGE SETTING -->
      @if (activeTab === 'preferences') {
        <div class="tab-content">
          <div class="section-title">
            <h3><i class="bi bi-gear-fill me-1"></i> {{ 'profile.settingsTitle' | translate }}</h3>
            <p>{{ 'profile.settingsSubtitle' | translate }}</p>
          </div>

          <!-- App Language Selector Card -->
          <div class="pref-card" style="margin-bottom: 16px;">
            <div class="pref-row">
              <div class="pref-info">
                <span class="pref-icon"><i class="bi bi-translate text-warning" style="font-size: 22px;"></i></span>
                <div>
                  <strong>{{ 'profile.languageSetting' | translate }}</strong>
                  <p class="muted">Select Language / மொழியைத் தேர்வு செய்க</p>
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" 
                  (click)="setLang('ta')" 
                  [style.background]="currentLang === 'ta' ? 'linear-gradient(135deg, #ffd700, #aa7c11)' : 'rgba(255,255,255,0.1)'"
                  [style.color]="currentLang === 'ta' ? '#000' : '#fff'"
                  style="border: none; padding: 7px 14px; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                  தமிழ்
                </button>
                <button type="button" 
                  (click)="setLang('en')" 
                  [style.background]="currentLang === 'en' ? 'linear-gradient(135deg, #ffd700, #aa7c11)' : 'rgba(255,255,255,0.1)'"
                  [style.color]="currentLang === 'en' ? '#000' : '#fff'"
                  style="border: none; padding: 7px 14px; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                  English
                </button>
              </div>
            </div>
          </div>

          <!-- Notification Preference -->
          <div class="pref-card">
            <div class="pref-row">
              <div class="pref-info">
                <span class="pref-icon"><i class="bi bi-star-fill text-warning" style="font-size: 20px;"></i></span>
                <div>
                  <strong>{{ 'profile.dailyNotif' | translate }}</strong>
                  <p class="muted">{{ 'profile.dailyNotifDesc' | translate }}</p>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" [checked]="dailyNotifPref" (change)="toggleDailyNotif()">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          @if (prefMsg) {
            <p [class.success]="prefSuccess" class="msg">{{ prefMsg }}</p>
          }
        </div>
      }

    </ion-content>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    ion-toolbar { --background: #0d0822; }
    .brand { color: #ffd700; font-weight: 700; font-size: 17px; }
    .profile-content { --background: #090614; }

    .profile-hero {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 16px;
      background: linear-gradient(135deg, #1a0f35, #0d0822);
      border-bottom: 1px solid rgba(212,175,55,0.2);
    }

    .avatar-circle {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #aa7c11);
      color: #000; font-weight: 800; font-size: 22px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .user-info h2 { margin: 0 0 2px; color: #fff; font-size: 18px; }
    .user-email { font-size: 11px; color: #8a8ab0; display: block; margin-bottom: 6px; }
    .rasi-tag { background: rgba(212,175,55,0.2); color: #ffd700; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }

    .tab-bar {
      display: flex;
      background: #120b29;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tab-bar button {
      flex: 1;
      padding: 10px 6px 8px;
      background: transparent;
      border: none;
      color: #8a8ab0;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      border-bottom: 2px solid transparent;
      min-width: 70px;
      transition: all 0.2s;
    }

    .tab-bar button span:first-child { font-size: 18px; }
    .tab-bar button.active { color: #ffd700; border-bottom-color: #ffd700; }

    .tab-content { padding: 14px 14px 80px; }

    .section-title { margin-bottom: 14px; }
    .section-title h3 { color: #fff; font-size: 16px; margin: 0 0 3px; }
    .section-title p { color: #8a8ab0; font-size: 12px; margin: 0; }

    .section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .section-title-row h3 { color: #fff; font-size: 16px; margin: 0; }
    .mark-all-btn { background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); color: #ffd700; padding: 4px 10px; border-radius: 8px; font-size: 11px; cursor: pointer; }

    .form-card { background: #160f33; border-radius: 14px; padding: 14px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 14px; }
    .form-group { margin-bottom: 10px; }
    label { font-size: 10px; color: #8a8ab0; display: block; margin-bottom: 3px; }
    .field { width: 100%; box-sizing: border-box; padding: 9px 10px; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 13px; }
    .textarea { resize: none; font-family: inherit; }
    .save-btn { padding: 10px 20px; background: linear-gradient(135deg, #d4af37, #aa7c11); border: none; border-radius: 8px; color: #000; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .msg { font-size: 12px; margin-top: 8px; }
    .msg.success { color: #4ade80; }

    .astro-card { background: linear-gradient(135deg, #1a0f35, #160b2c); border: 1px solid rgba(212,175,55,0.3); border-radius: 14px; padding: 14px; }
    .astro-card h4 { color: #ffd700; font-size: 14px; margin: 0 0 12px; }
    .astro-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .astro-item { background: rgba(255,255,255,0.04); padding: 8px 10px; border-radius: 8px; }
    .al { font-size: 10px; color: #8a8ab0; display: block; margin-bottom: 2px; }
    .av { font-size: 13px; color: #fff; font-weight: 600; }
    .av.gold { color: #ffd700; }

    .booking-card { background: #160f33; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; margin-bottom: 10px; }
    .booking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .booking-id { font-size: 11px; color: #8a8ab0; font-family: monospace; }
    .status-pill { padding: 3px 9px; border-radius: 12px; font-size: 10px; font-weight: 700; }
    .status-pill.pending { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .status-pill.completed { background: rgba(34,197,94,0.2); color: #4ade80; }
    .booking-card h4 { color: #fff; font-size: 14px; margin: 0 0 6px; }
    .booking-meta { display: flex; gap: 12px; font-size: 12px; color: #8a8ab0; margin-bottom: 4px; }
    .muted { color: #8a8ab0; font-size: 11px; }
    .chart-link { color: #60a5fa; font-size: 12px; text-decoration: none; display: block; margin-top: 8px; font-weight: 600; }

    .payment-card { background: #160f33; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; }
    .payment-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
    .payment-right { text-align: right; }
    .amount { display: block; font-size: 16px; font-weight: 700; color: #ffd700; }
    .pay-status { font-size: 10px; padding: 2px 8px; border-radius: 10px; }
    .pay-status.paid { background: rgba(34,197,94,0.2); color: #4ade80; }
    .pay-status.pending { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .payment-footer { display: flex; justify-content: space-between; }

    .notif-card { display: flex; gap: 12px; background: #160f33; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px; margin-bottom: 8px; cursor: pointer; position: relative; transition: background 0.2s; }
    .notif-card.unread { background: #1a0f35; border-color: rgba(212,175,55,0.25); }
    .notif-icon { font-size: 22px; flex-shrink: 0; }
    .notif-body strong { color: #fff; font-size: 13px; }
    .notif-body p { color: #a0a0c0; font-size: 12px; margin: 3px 0; line-height: 1.4; }
    .unread-dot { position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; border-radius: 50%; background: #ffd700; }

    .empty-state { text-align: center; padding: 50px 20px; }
    .empty-state span { font-size: 40px; }
    .empty-state p { color: #8a8ab0; font-size: 14px; margin-top: 10px; }

    .pref-card { background: #160f33; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 14px; margin-bottom: 14px; }
    .pref-row { display: flex; align-items: center; justify-content: space-between; }
    .pref-info { display: flex; align-items: center; gap: 12px; flex: 1; }
    .pref-icon { font-size: 24px; flex-shrink: 0; }
    .pref-info strong { color: #fff; font-size: 14px; display: block; margin-bottom: 2px; }
    .pref-info .muted { font-size: 11px; line-height: 1.4; }

    .toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; inset: 0; background: rgba(255,255,255,0.15); border-radius: 26px; cursor: pointer; transition: 0.3s; }
    .toggle-slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.3s; }
    .toggle-switch input:checked + .toggle-slider { background: linear-gradient(135deg, #d4af37, #aa7c11); }
    .toggle-switch input:checked + .toggle-slider::before { transform: translateX(22px); }
  `]
})
export class ProfilePage implements OnInit {
  tabs = [
    { key: 'profile', icon: 'bi bi-person-fill', labelKey: 'profile.tabProfile' },
    { key: 'history', icon: 'bi bi-clock-history', labelKey: 'profile.tabHistory' },
    { key: 'payments', icon: 'bi bi-credit-card-fill', labelKey: 'profile.tabPayments' },
    { key: 'notifications', icon: 'bi bi-bell-fill', labelKey: 'profile.tabNotifs' },
    { key: 'preferences', icon: 'bi bi-gear-fill', labelKey: 'profile.tabSettings' },
  ];
  activeTab = 'profile';

  userName = '';
  userEmail = '';
  jathagam: any = null;

  editProfile = { name: '', phone: '', address: '' };
  savingProfile = false;
  profileMsg = '';
  profileSuccess = false;

  bookings: any[] = [];
  loadingHistory = false;

  payments: any[] = [];
  loadingPayments = false;

  notifications: any[] = [];
  loadingNotifs = false;
  unreadCount = 0;

  dailyNotifPref = true;
  prefMsg = '';
  prefSuccess = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    public translationService: TranslationService
  ) { }

  get currentLang(): LanguageCode {
    return this.translationService.currentLanguage();
  }

  setLang(lang: LanguageCode) {
    this.translationService.setLanguage(lang);
  }

  toggleLang() {
    this.translationService.toggleLanguage();
  }

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

  ngOnInit() {
    this.loadProfile();
    this.loadHistory();
    this.loadPayments();
    this.loadNotifications();
    this.loadPreferences();
  }

  get token(): string { return this.authService.getToken() || ''; }
  get headers(): any { return this.authService.getAuthHeaders(); }

  loadProfile() {
    this.http.get<any>(`${environment.apiUrl}/user/profile`, this.headers).subscribe({
      next: (res: any) => {
        if (res) {
          this.editProfile = { name: res.name || '', phone: res.phone || '', address: res.address || '' };
          this.jathagam = res.jathagam_details;
          this.userName = res.name || '';
        }
      },
      error: () => { }
    });
  }

  saveProfile() {
    this.savingProfile = true;
    this.profileMsg = '';
    this.http.put<any>(`${environment.apiUrl}/user/profile`, this.editProfile, this.headers).subscribe({
      next: (res: any) => {
        this.profileMsg = this.translationService.translate('common.success', 'சுயவிவரம் புதுப்பிக்கப்பட்டது!');
        this.profileSuccess = true;
        this.savingProfile = false;
      },
      error: () => { this.profileMsg = this.translationService.translate('common.error', 'பிழை ஏற்பட்டது.'); this.profileSuccess = false; this.savingProfile = false; }
    });
  }

  loadHistory() {
    this.loadingHistory = true;
    this.http.get<any>(`${environment.apiUrl}/user/bookings`, this.headers).subscribe({
      next: (res: any) => { this.bookings = res?.bookings || []; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }

  loadPayments() {
    this.loadingPayments = true;
    this.http.get<any>(`${environment.apiUrl}/user/payments`, this.headers).subscribe({
      next: (res: any) => { this.payments = res?.payments || []; this.loadingPayments = false; },
      error: () => { this.loadingPayments = false; }
    });
  }

  loadNotifications() {
    this.loadingNotifs = true;
    this.http.get<any>(`${environment.apiUrl}/user/notifications`, this.headers).subscribe({
      next: (res: any) => {
        this.notifications = res?.notifications || [];
        this.unreadCount = res?.unread_count || 0;
        this.loadingNotifs = false;
      },
      error: () => { this.loadingNotifs = false; }
    });
  }

  markRead(n: any) {
    if (n.is_read) return;
    this.http.put<any>(`${environment.apiUrl}/user/notifications/${n.id}/read`, {}, this.headers).subscribe({
      next: (res: any) => { n.is_read = true; this.unreadCount = Math.max(0, this.unreadCount - 1); },
      error: () => { }
    });
  }

  markAllRead() {
    this.http.put<any>(`${environment.apiUrl}/user/notifications/read-all`, {}, this.headers).subscribe({
      next: (res: any) => { this.notifications.forEach(n => n.is_read = true); this.unreadCount = 0; },
      error: () => { }
    });
  }

  getNotifIconClass(type: string): string {
    const icons: Record<string, string> = {
      booking_confirmed: 'bi bi-check-circle-fill text-success',
      booking_fulfilled: 'bi bi-check-all text-success',
      rasi_palan: 'bi bi-star-fill text-warning',
      certificate: 'bi bi-trophy-fill text-warning',
      course: 'bi bi-journal-bookmark-fill text-primary',
      general: 'bi bi-bell-fill text-info'
    };
    return icons[type] || 'bi bi-bell-fill text-info';
  }

  loadPreferences() {
    this.http.get<any>(`${environment.apiUrl}/user/notification-preferences`, this.headers).subscribe({
      next: (res: any) => { this.dailyNotifPref = res?.daily_rasi_notification ?? true; },
      error: () => { }
    });
  }

  toggleDailyNotif() {
    this.prefMsg = '';
    const newValue = !this.dailyNotifPref;
    this.http.put<any>(`${environment.apiUrl}/user/notification-preferences`, { daily_rasi_notification: newValue }, this.headers).subscribe({
      next: (res: any) => {
        this.dailyNotifPref = res?.daily_rasi_notification;
        this.prefMsg = res?.message || 'விருப்பம் புதுப்பிக்கப்பட்டது.';
        this.prefSuccess = true;
      },
      error: () => {
        this.prefMsg = 'பிழை ஏற்பட்டது.';
        this.prefSuccess = false;
      }
    });
  }
}
