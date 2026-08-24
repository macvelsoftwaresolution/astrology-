import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BackButtonService } from '../../services/back-button.service';
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

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private http: HttpClient,
    private backButtonService: BackButtonService
  ) { }

  ngOnInit() {
    this.loadNotifications();
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
    this.loadNotifications();
  }

  get token() {
    return sessionStorage.getItem('auth_token') || '';
  }

  get headers() {
    return { headers: { Authorization: `Bearer ${this.token}` } };
  }

  loadNotifications() {
    this.loading = true;
    const userNotifs$ = this.http.get<any>(`${environment.apiUrl}/user/notifications`, this.headers);
    const liveClasses$ = this.http.get<any>(`${environment.apiUrl}/public/live-class/ILANILAI`);

    userNotifs$.subscribe({
      next: (res) => {
        let notifs = res.notifications || [];
        this.unreadCount = res.unread_count || 0;

        // Fetch live class announcements to enrich the notifications feed
        liveClasses$.subscribe({
          next: (lcRes) => {
            if (lcRes && lcRes.data && Array.isArray(lcRes.data)) {
              const activeLives = lcRes.data.filter((lc: any) => lc.is_active);
              const liveNotifs = activeLives.map((lc: any) => ({
                id: 'live_' + lc.id,
                title: '🔴 நேரலை வகுப்பு: ' + lc.title,
                body: lc.description || 'நேரலை வகுப்பில் உடனடியாக இணையவும்.',
                type: 'course',
                is_read: false,
                is_live: true,
                link: lc.link,
                created_at: lc.created_at || new Date().toISOString()
              }));
              notifs = [...liveNotifs, ...notifs];
              this.unreadCount += liveNotifs.length;
            }
            this.notifications = notifs;
            this.loading = false;
          },
          error: () => {
            this.notifications = notifs;
            this.loading = false;
          }
        });
      },
      error: () => {
        // Fallback: still try to load live classes even if user auth fails
        liveClasses$.subscribe({
          next: (lcRes) => {
            if (lcRes && lcRes.data && Array.isArray(lcRes.data)) {
              const activeLives = lcRes.data.filter((lc: any) => lc.is_active);
              this.notifications = activeLives.map((lc: any) => ({
                id: 'live_' + lc.id,
                title: '🔴 நேரலை வகுப்பு: ' + lc.title,
                body: lc.description || 'நேரலை வகுப்பில் உடனடியாக இணையவும்.',
                type: 'course',
                is_read: false,
                is_live: true,
                link: lc.link,
                created_at: lc.created_at || new Date().toISOString()
              }));
              this.unreadCount = this.notifications.length;
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

  getNotifIcon(type: string): string {
    const icons: Record<string, string> = {
      booking_confirmed: 'bi-check-circle-fill text-success',
      booking_fulfilled: 'bi-patch-check-fill text-primary',
      rasi_palan: 'bi-stars text-gold',
      certificate: 'bi-award-fill text-warning',
      course: 'bi-book-fill text-info',
      general: 'bi-bell-fill text-maroon'
    };
    return icons[type] || 'bi-bell-fill text-maroon';
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
      this.router.navigate(['/home'], { queryParams: { tab: 'services' } });
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
