import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { TranslationService, LanguageCode } from '../../services/translation.service';
import { ToastService, ToastData } from '../../services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { environment } from '../../../environments/environment';

// Subcomponents
import { OverviewTabComponent } from './tabs/overview-tab/overview-tab';
import { TeamTabComponent } from './tabs/team-tab/team-tab';
import { LmsTabComponent } from './tabs/lms-tab/lms-tab';
import { CourierTabComponent } from './tabs/courier-tab/courier-tab';
import { GradingTabComponent } from './tabs/grading-tab/grading-tab';
import { ServicesTabComponent } from './tabs/services-tab/services-tab';
import { RasiEditorTabComponent } from './tabs/rasi-editor-tab/rasi-editor-tab';
import { MatchesTabComponent } from './tabs/matches-tab/matches-tab';
import { MatrimonyTab } from './tabs/matrimony-tab/matrimony-tab';
import { PaymentsTabComponent } from './tabs/payments-tab/payments-tab';
import { BroadcastTabComponent } from './tabs/broadcast-tab/broadcast-tab';
import { UsersTabComponent } from './tabs/users-tab/users-tab';
import { LmsSettingsTabComponent } from './tabs/lms-settings-tab/lms-settings-tab';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    OverviewTabComponent,
    TeamTabComponent,
    LmsTabComponent,
    LmsSettingsTabComponent,
    CourierTabComponent,
    GradingTabComponent,
    ServicesTabComponent,
    RasiEditorTabComponent,
    MatchesTabComponent,
    MatrimonyTab,
    PaymentsTabComponent,
    BroadcastTabComponent,
    UsersTabComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentTab = 'overview';
  currentUser: User | null = null;
  mobileMenuOpen = false;

  // Global Toast State
  toastData: ToastData = { show: false, message: '', type: 'success', title: '' };
  private toastSub: any;

  // Sidebar Category Dropdown States
  astrologyCategoryOpen = false;
  learnCategoryOpen = false;

  // Admin Profile Modal State
  adminProfileModalOpen = false;
  adminProfileForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    new_password: ''
  };
  adminProfileSaving = false;
  adminProfileSuccessMsg = '';
  adminProfileErrMsg = '';

  // Live Notifications State
  notificationsOpen = false;
  notifications: any[] = [];
  unreadNotificationsCount = 0;
  isLoadingNotifications = false;
  readNotificationIds: Set<string> = new Set();
  latestAdminAlert: any = null;
  showAdminAlertBanner = false;
  isHidingAdminBanner = false;
  private notifInterval: any = null;
  private adminAlertTimer: any = null;

  constructor(
    private authService: AuthService,
    public translationService: TranslationService,
    public toastService: ToastService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  setLanguage(lang: LanguageCode): void {
    this.translationService.setLanguage(lang);
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    // Subscribe to Global Toast
    this.toastSub = this.toastService.toast$.subscribe((data) => {
      this.toastData = data;
      this.cdr.detectChanges();
    });

    // Load read notifications from sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('admin_read_notifications');
        if (stored) {
          this.readNotificationIds = new Set(JSON.parse(stored));
        }
      } catch {
        this.readNotificationIds = new Set();
      }

      // Single initial fetch on dashboard load
      this.loadNotifications();
    }

    // Listen to URL Path parameter (:section e.g. /admin/rasi-editor)
    this.route.params.subscribe(params => {
      if (params['section']) {
        this.currentTab = params['section'];
        this.updateCategoryState();
        this.cdr.detectChanges();
      }
    });

    // Backward compatibility for queryParams ?tab=...
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.currentTab = params['tab'];
        this.updateCategoryState();
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.toastSub) {
      this.toastSub.unsubscribe();
    }
    if (this.notifInterval) {
      clearInterval(this.notifInterval);
      this.notifInterval = null;
    }
    if (this.adminAlertTimer) {
      clearTimeout(this.adminAlertTimer);
      this.adminAlertTimer = null;
    }
  }

  closeAdminAlertBanner(): void {
    if (this.adminAlertTimer) {
      clearTimeout(this.adminAlertTimer);
      this.adminAlertTimer = null;
    }
    this.isHidingAdminBanner = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showAdminAlertBanner = false;
      this.isHidingAdminBanner = false;
      this.cdr.detectChanges();
    }, 350);
  }

  private isFetchingAlerts = false;
  private lastFetchTime = 0;

  loadNotifications(force: boolean = false): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    // Block duplicate / rapid calls within 3 seconds unless forced
    if (!force && (this.isFetchingAlerts || (now - this.lastFetchTime < 3000))) {
      return;
    }

    this.isFetchingAlerts = true;
    this.lastFetchTime = now;
    this.isLoadingNotifications = true;

    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/notifications/activity-alerts`, headers).subscribe({
      next: (res) => {
        this.isFetchingAlerts = false;
        const alerts = res.alerts || [];
        this.notifications = alerts.map((a: any) => ({
          ...a,
          is_read: this.readNotificationIds.has(a.id)
        }));

        const unreadList = this.notifications.filter(n => !n.is_read);
        const prevCount = this.unreadNotificationsCount;
        this.unreadNotificationsCount = unreadList.length;

        // If new unread activity alert arrived, show top slide-down animated toast banner!
        if (unreadList.length > 0 && (unreadList.length > prevCount || !this.latestAdminAlert)) {
          this.latestAdminAlert = unreadList[0];
          const dismissKey = 'admin_alert_banner_dismissed_' + this.latestAdminAlert.id;
          if (!sessionStorage.getItem(dismissKey)) {
            this.showAdminAlertBanner = true;
            this.isHidingAdminBanner = false;
            sessionStorage.setItem(dismissKey, 'true');

            if (this.adminAlertTimer) clearTimeout(this.adminAlertTimer);
            this.adminAlertTimer = setTimeout(() => {
              this.closeAdminAlertBanner();
            }, 3000);
          }
        }

        this.isLoadingNotifications = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isFetchingAlerts = false;
        this.isLoadingNotifications = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleNotifications(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.loadNotifications(true);
    }
  }

  closeNotifications(): void {
    this.notificationsOpen = false;
    this.cdr.detectChanges();
  }

  openNotification(n: any): void {
    // 1. Mark as read
    this.readNotificationIds.add(n.id);
    n.is_read = true;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('admin_read_notifications', JSON.stringify(Array.from(this.readNotificationIds)));
      } catch { }
    }
    this.unreadNotificationsCount = this.notifications.filter(item => !item.is_read).length;

    // 2. Close notification dropdown
    this.notificationsOpen = false;

    // 3. Navigate directly to target tab
    if (n.target_tab) {
      this.selectTab(n.target_tab);
    }
    this.cdr.detectChanges();
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => {
      n.is_read = true;
      this.readNotificationIds.add(n.id);
    });
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('admin_read_notifications', JSON.stringify(Array.from(this.readNotificationIds)));
      } catch { }
    }
    this.unreadNotificationsCount = 0;
    this.cdr.detectChanges();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'booking':
        return 'bi-calendar-check-fill';
      case 'book_order':
        return 'bi-box-seam-fill';
      case 'submission':
        return 'bi-award-fill';
      case 'payment':
        return 'bi-credit-card-2-front-fill';
      case 'marriage_match':
        return 'bi-heart-fill';
      case 'user':
        return 'bi-person-plus-fill';
      default:
        return 'bi-bell-fill';
    }
  }

  getNotificationColorClass(type: string): string {
    switch (type) {
      case 'booking':
        return 'notif-icon-amber';
      case 'book_order':
        return 'notif-icon-blue';
      case 'submission':
        return 'notif-icon-purple';
      case 'payment':
        return 'notif-icon-emerald';
      case 'marriage_match':
        return 'notif-icon-rose';
      case 'user':
        return 'notif-icon-cyan';
      default:
        return 'notif-icon-gold';
    }
  }

  getCurrentTabTitle(): string {
    const titles: Record<string, string> = {
      'overview': 'nav.overview',
      'team': 'nav.team',
      'services': 'nav.services',
      'rasi-editor': 'nav.rasi_editor',
      'matches': 'nav.matches',
      'matrimony': 'nav.matrimony',
      'lms': 'nav.lms',
      'lms-settings': 'nav.lmsSettings',
      'courier': 'nav.courier',
      'grading': 'nav.grading',
      'payments': 'nav.payments',
      'broadcast': 'nav.broadcast',
      'users': 'nav.users'
    };
    return titles[this.currentTab] || 'nav.overview';
  }

  toggleAstrologyCategory(): void {
    this.astrologyCategoryOpen = !this.astrologyCategoryOpen;
    if (this.astrologyCategoryOpen) {
      this.learnCategoryOpen = false;
    }
  }

  toggleLearnCategory(): void {
    this.learnCategoryOpen = !this.learnCategoryOpen;
    if (this.learnCategoryOpen) {
      this.astrologyCategoryOpen = false;
    }
  }

  updateCategoryState(): void {
    if (this.isAstrologyActive()) {
      this.astrologyCategoryOpen = true;
      this.learnCategoryOpen = false;
    } else if (this.isLearnActive()) {
      this.learnCategoryOpen = true;
      this.astrologyCategoryOpen = false;
    } else {
      this.astrologyCategoryOpen = false;
      this.learnCategoryOpen = false;
    }
  }

  isAstrologyActive(): boolean {
    return ['team', 'services', 'rasi-editor', 'matches', 'matrimony'].includes(this.currentTab);
  }

  isLearnActive(): boolean {
    return ['lms', 'lms-settings', 'courier', 'grading'].includes(this.currentTab);
  }

  selectTab(tabName: string): void {
    this.currentTab = tabName;
    this.mobileMenuOpen = false;
    this.updateCategoryState();

    this.router.navigate(['/admin', tabName]);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openAdminProfileModal(): void {
    this.currentUser = this.authService.getUser();
    this.adminProfileForm = {
      name: this.currentUser?.name || '',
      email: this.currentUser?.email || '',
      phone: this.currentUser?.phone || '',
      address: (this.currentUser as any)?.address || '',
      new_password: ''
    };
    this.adminProfileSuccessMsg = '';
    this.adminProfileErrMsg = '';
    this.adminProfileModalOpen = true;
  }

  saveAdminProfile(): void {
    this.adminProfileSaving = true;
    this.adminProfileSuccessMsg = '';
    this.adminProfileErrMsg = '';

    const payload: any = {
      name: this.adminProfileForm.name,
      email: this.adminProfileForm.email,
      phone: this.adminProfileForm.phone,
      address: this.adminProfileForm.address
    };

    if (this.adminProfileForm.new_password) {
      payload.new_password = this.adminProfileForm.new_password;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`${environment.apiUrl}/user/profile`, payload, headers).subscribe({
      next: (res) => {
        this.adminProfileSaving = false;
        if (res.user) {
          this.currentUser = res.user;
          this.authService.setUser(res.user);
        }
        this.adminProfileSuccessMsg = '✅ சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.adminProfileModalOpen = false;
          this.adminProfileSuccessMsg = '';
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        this.adminProfileSaving = false;
        this.adminProfileErrMsg = err?.error?.message || 'சுயவிவரத்தைப் புதுப்பிப்பதில் பிழை ஏற்பட்டது.';
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

