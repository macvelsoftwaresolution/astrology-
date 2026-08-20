import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { TranslationService, LanguageCode } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { environment } from '../../../environments/environment';

// Subcomponents
import { OverviewTabComponent } from './tabs/overview-tab/overview-tab.component';
import { TeamTabComponent } from './tabs/team-tab/team-tab.component';
import { LmsTabComponent } from './tabs/lms-tab/lms-tab.component';
import { CourierTabComponent } from './tabs/courier-tab/courier-tab.component';
import { GradingTabComponent } from './tabs/grading-tab/grading-tab.component';
import { ServicesTabComponent } from './tabs/services-tab/services-tab.component';
import { RasiEditorTabComponent } from './tabs/rasi-editor-tab/rasi-editor-tab.component';
import { MatchesTabComponent } from './tabs/matches-tab/matches-tab.component';
import { PaymentsTabComponent } from './tabs/payments-tab/payments-tab.component';
import { BroadcastTabComponent } from './tabs/broadcast-tab/broadcast-tab.component';
import { UsersTabComponent } from './tabs/users-tab/users-tab.component';

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
    CourierTabComponent,
    GradingTabComponent,
    ServicesTabComponent,
    RasiEditorTabComponent,
    MatchesTabComponent,
    PaymentsTabComponent,
    BroadcastTabComponent,
    UsersTabComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentTab = 'overview';
  currentUser: User | null = null;
  mobileMenuOpen = false;

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
  private notifInterval: any = null;

  constructor(
    private authService: AuthService,
    public translationService: TranslationService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  setLanguage(lang: LanguageCode): void {
    this.translationService.setLanguage(lang);
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    
    // Load read notifications from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('admin_read_notifications');
        if (stored) {
          this.readNotificationIds = new Set(JSON.parse(stored));
        }
      } catch {
        this.readNotificationIds = new Set();
      }

      this.loadNotifications();

      // Poll notifications every 30 seconds for live real-time feel
      this.notifInterval = setInterval(() => {
        this.loadNotifications();
      }, 30000);
    }

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.currentTab = params['tab'];
        // Auto-expand the category if a tab within it is selected, and close others
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
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.notifInterval) {
      clearInterval(this.notifInterval);
      this.notifInterval = null;
    }
  }

  loadNotifications(): void {
    if (typeof window === 'undefined') return;
    this.isLoadingNotifications = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/notifications/activity-alerts`, headers).subscribe({
      next: (res) => {
        const alerts = res.alerts || [];
        this.notifications = alerts.map((a: any) => ({
          ...a,
          is_read: this.readNotificationIds.has(a.id)
        }));
        this.unreadNotificationsCount = this.notifications.filter(n => !n.is_read).length;
        this.isLoadingNotifications = false;
        this.cdr.detectChanges();
      },
      error: () => {
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
      this.loadNotifications();
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
        localStorage.setItem('admin_read_notifications', JSON.stringify(Array.from(this.readNotificationIds)));
      } catch {}
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
        localStorage.setItem('admin_read_notifications', JSON.stringify(Array.from(this.readNotificationIds)));
      } catch {}
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
      'lms': 'nav.lms',
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

  isAstrologyActive(): boolean {
    return ['team', 'services', 'rasi-editor', 'matches'].includes(this.currentTab);
  }

  isLearnActive(): boolean {
    return ['lms', 'courier', 'grading'].includes(this.currentTab);
  }

  selectTab(tabName: string): void {
    this.currentTab = tabName;
    this.mobileMenuOpen = false;
    
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabName },
      queryParamsHandling: 'merge'
    });
    
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

