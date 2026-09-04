import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BackButtonService } from '../../services/back-button.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: false
})
export class NotificationsPage implements OnInit {
  notifications: any[] = [];
  unreadCount: number = 0;
  loading: boolean = false;
  currentContext: 'all' | 'learn' | 'astrology' = 'all';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.detectContext();
    this.loadNotifications();
  }

  detectContext() {
    const fromParam = this.route.snapshot.queryParams['from'];
    if (fromParam === 'learn') {
      this.currentContext = 'learn';
    } else if (fromParam === 'astrology') {
      this.currentContext = 'astrology';
    } else {
      this.currentContext = 'all';
    }
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

  ionViewWillEnter() {
    this.detectContext();
    this.loadNotifications();
  }

  get token() {
    return this.authService.getToken() || '';
  }

  get headers() {
    return this.authService.getAuthHeaders();
  }

  filterByContext(notifs: any[]): any[] {
    if (this.currentContext === 'learn') {
      const learnTypes = ['book_order', 'course', 'certificate', 'submission', 'live_class'];
      return notifs.filter(n => learnTypes.includes(n.type) || (typeof n.id === 'string' && n.id.startsWith('live_')));
    } else if (this.currentContext === 'astrology') {
      const astroTypes = ['booking', 'booking_confirmed', 'booking_fulfilled', 'jathagam', 'marriage', 'marriage_match', 'payment', 'transaction', 'rasi_palan', 'general'];
      return notifs.filter(n => astroTypes.includes(n.type) && !(typeof n.id === 'string' && n.id.startsWith('live_')));
    }
    return notifs;
  }

  loadNotifications() {
    this.loading = true;
    this.cdr.detectChanges();
    const timestamp = Date.now();
    const userNotifs$ = this.http.get<any>(`${environment.apiUrl}/user/notifications?_t=${timestamp}`, this.headers);
    const liveClasses$ = this.http.get<any>(`${environment.apiUrl}/public/live-class/ILANILAI?_t=${timestamp}`);

    userNotifs$.subscribe({
      next: (res) => {
        let notifs = res.notifications || [];

        // If context is astrology, do not load live class education items
        if (this.currentContext === 'astrology') {
          const filtered = this.filterByContext(notifs);
          this.notifications = this.consolidateNotifications(filtered);
          this.unreadCount = this.notifications.filter(n => !n.is_read).length;
          this.loading = false;
          return;
        }

        // Fetch live class announcements for learn context
        liveClasses$.subscribe({
          next: (lcRes) => {
            if (lcRes && lcRes.data && Array.isArray(lcRes.data)) {
              const activeLives = lcRes.data.filter((lc: any) => {
                if (!lc.is_active) return false;
                try {
                  if (localStorage.getItem('dismissed_live_live_' + lc.id)) return false;
                } catch {}
                return true;
              });
              const liveNotifs = activeLives.map((lc: any) => ({
                id: 'live_' + lc.id,
                title: 'நேரலை வகுப்பு: ' + lc.title,
                body: lc.description || 'நேரலை வகுப்பில் உடனடியாக இணையவும்.',
                type: 'course',
                is_read: false,
                is_live: true,
                link: lc.link,
                created_at: lc.created_at || new Date().toISOString()
              }));
              notifs = [...liveNotifs, ...notifs];
            }
            const filtered = this.filterByContext(notifs);
            this.notifications = this.consolidateNotifications(filtered);
            this.unreadCount = this.notifications.filter(n => !n.is_read).length;
            this.loading = false;
          },
          error: () => {
            const filtered = this.filterByContext(notifs);
            this.notifications = this.consolidateNotifications(filtered);
            this.unreadCount = this.notifications.filter(n => !n.is_read).length;
            this.loading = false;
          }
        });
      },
      error: () => {
        if (this.currentContext === 'astrology') {
          this.notifications = [];
          this.unreadCount = 0;
          this.loading = false;
          return;
        }
        liveClasses$.subscribe({
          next: (lcRes) => {
            if (lcRes && lcRes.data && Array.isArray(lcRes.data)) {
              const activeLives = lcRes.data.filter((lc: any) => lc.is_active);
              const liveNotifs = activeLives.map((lc: any) => ({
                id: 'live_' + lc.id,
                title: 'நேரலை வகுப்பு: ' + lc.title,
                body: lc.description || 'நேரலை வகுப்பில் உடனடியாக இணையவும்.',
                type: 'course',
                is_read: false,
                is_live: true,
                link: lc.link,
                created_at: lc.created_at || new Date().toISOString()
              }));
              const filtered = this.filterByContext(liveNotifs);
              this.notifications = this.consolidateNotifications(filtered);
              this.unreadCount = this.notifications.filter(n => !n.is_read).length;
            }
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  consolidateNotifications(rawNotifs: any[]): any[] {
    const seenOrders = new Set<string>();
    const result: any[] = [];

    for (const n of rawNotifs) {
      if (n.type === 'book_order') {
        let orderNum = n.data?.order_number;
        if (!orderNum && n.body) {
          const match = (n.body + ' ' + (n.title || '')).match(/(BOOK-ORD-[A-Za-z0-9\-]+)/);
          if (match) orderNum = match[1];
        }

        if (orderNum) {
          if (seenOrders.has(orderNum)) {
            // Skip older status entries for this same order
            continue;
          }
          seenOrders.add(orderNum);
        }
      }
      result.push(n);
    }
    return result;
  }

  showClearAllModal = false;
  showDeleteSingleModal = false;
  selectedNotifToDelete: any = null;

  openDeleteSingleModal(n: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedNotifToDelete = n;
    this.showDeleteSingleModal = true;
  }

  cancelDeleteModal() {
    this.showDeleteSingleModal = false;
    this.selectedNotifToDelete = null;
    this.showClearAllModal = false;
  }

  confirmDeleteSingle() {
    if (!this.selectedNotifToDelete) return;
    const n = this.selectedNotifToDelete;
    const idx = this.notifications.findIndex(item => item.id === n.id);
    if (idx !== -1) {
      if (!n.is_read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifications.splice(idx, 1);
    }

    if (typeof n.id === 'string' && n.id.startsWith('live_')) {
      try {
        localStorage.setItem('dismissed_live_' + n.id, 'true');
      } catch {}
      this.cancelDeleteModal();
      return;
    }

    this.http.delete<any>(`${environment.apiUrl}/user/notifications/${n.id}`, this.headers).subscribe({
      next: () => {},
      error: () => {}
    });
    this.cancelDeleteModal();
  }

  deleteNotification(n: any, event?: Event) {
    this.openDeleteSingleModal(n, event);
  }

  clearAll() {
    if (this.notifications.length === 0) return;
    this.showClearAllModal = true;
  }

  confirmClearAll() {
    this.showClearAllModal = false;
    this.notifications = [];
    this.unreadCount = 0;
    this.http.delete<any>(`${environment.apiUrl}/user/notifications`, this.headers).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  markRead(n: any) {
    if (n.is_read) return;
    n.is_read = true;
    this.unreadCount = Math.max(0, this.unreadCount - 1);
    if (typeof n.id === 'string' && n.id.startsWith('live_')) {
      return;
    }
    this.http.put<any>(`${environment.apiUrl}/user/notifications/${n.id}/read`, {}, this.headers).subscribe({
      next: () => {}
    });
  }

  markAllRead() {
    this.notifications.forEach(n => n.is_read = true);
    this.unreadCount = 0;
    this.http.put<any>(`${environment.apiUrl}/user/notifications/read-all`, {}, this.headers).subscribe({
      next: () => {}
    });
  }

  cleanTitle(str: string): string {
    if (!str) return '';
    return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE00}-\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
  }

  getNotifIcon(type: string): string {
    const icons: Record<string, string> = {
      seminar: 'bi-mic-fill',
      booking: 'bi-calendar-check-fill',
      booking_confirmed: 'bi-check-circle-fill',
      booking_fulfilled: 'bi-patch-check-fill',
      book_order: 'bi-box-seam-fill',
      rasi_palan: 'bi-stars',
      certificate: 'bi-award-fill',
      course: 'bi-book-fill',
      jathagam: 'bi-journal-richtext',
      payment: 'bi-credit-card-fill',
      marriage_match: 'bi-heart-fill',
      general: 'bi-bell-fill'
    };
    return icons[type] || 'bi-bell-fill';
  }

  getNotifCategoryClass(type: string): string {
    const classes: Record<string, string> = {
      seminar: 'cat-purple',
      booking: 'cat-booking',
      booking_confirmed: 'cat-success',
      booking_fulfilled: 'cat-success',
      book_order: 'cat-warning',
      rasi_palan: 'cat-gold',
      certificate: 'cat-warning',
      course: 'cat-info',
      jathagam: 'cat-purple',
      payment: 'cat-emerald',
      marriage_match: 'cat-rose',
      general: 'cat-maroon'
    };
    return classes[type] || 'cat-maroon';
  }

  isImage(url: string): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url) || url.includes('data:image');
  }

  getChartUrl(n: any): string | null {
    if (n.data && n.data.chart_url) return n.data.chart_url;
    if (n.data && n.data.image_url) return n.data.image_url;
    if (n.chart_url) return n.chart_url;
    if (n.image_url) return n.image_url;
    return null;
  }

  getVideoUrl(n: any): string | null {
    if (n.data && n.data.video_url) return n.data.video_url;
    if (n.video_url) return n.video_url;
    const match = (n.body || '').match(/(https?:\/\/[^\s]+(youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm)[^\s]*)/i);
    return match ? match[0] : null;
  }

  handleNotificationClick(n: any) {
    this.markRead(n);

    // If notification has a direct link (e.g. Live Class Meet URL)
    if (n.link) {
      window.open(n.link, '_blank');
      return;
    }

    // 1. If notification has a video URL, open video
    const video = this.getVideoUrl(n);
    if (video) {
      window.open(video, '_blank');
      return;
    }

    // 2. Type-based direct route redirection
    if (n.type === 'book_order') {
      let orderNumber = n.data?.order_number || null;
      if (!orderNumber && n.body) {
        const match = (n.body + ' ' + (n.title || '')).match(/(BOOK-ORD-[A-Za-z0-9\-]+)/);
        if (match) orderNumber = match[1];
      }
      this.router.navigate(['/learn'], {
        queryParams: {
          tab: 'profile',
          option: 'orders',
          order: orderNumber
        }
      });
      return;
    }

    if (n.type === 'booking_fulfilled' || n.type === 'booking_confirmed') {
      this.router.navigate(['/home'], { queryParams: { tab: 'profile', option: 'services' } });
      return;
    }

    if (n.type === 'jathagam') {
      this.router.navigate(['/home'], { queryParams: { tab: 'profile', option: 'jathagam' } });
      return;
    }

    if (n.type === 'payment' || n.type === 'transaction') {
      this.router.navigate(['/home'], { queryParams: { tab: 'profile', option: 'payments' } });
      return;
    }

    if (n.type === 'rasi_palan') {
      this.router.navigate(['/home'], { queryParams: { flow: 'rasi-palan' } });
      return;
    }

    if (n.type === 'marriage' || n.type === 'matching') {
      this.router.navigate(['/home'], { queryParams: { tab: 'matching' } });
      return;
    }

    if (n.type === 'course' || n.type === 'certificate') {
      this.router.navigate(['/learn'], { queryParams: { tab: 'lessons' } });
      return;
    }

    // 3. Data-driven redirect
    if (n.data?.redirect_tab) {
      this.router.navigate(['/home'], { 
        queryParams: { 
          tab: n.data.redirect_tab, 
          option: n.data.redirect_option || null,
          flow: n.data.redirect_flow || null 
        } 
      });
      return;
    }
    if (n.data?.redirect_flow) {
      this.router.navigate(['/home'], { queryParams: { flow: n.data.redirect_flow } });
      return;
    }
  }

  goBack() {
    this.navCtrl.back();
  }
}
