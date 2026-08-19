import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
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
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadNotifications();
  }

  ionViewWillEnter() {
    this.loadNotifications();
  }

  get token() {
    return localStorage.getItem('auth_token') || '';
  }

  get headers() {
    return { headers: { Authorization: `Bearer ${this.token}` } };
  }

  loadNotifications() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/user/notifications`, this.headers).subscribe({
      next: (res) => {
        this.notifications = res.notifications || [];
        this.unreadCount = res.unread_count || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markRead(n: any) {
    if (n.is_read) return;
    this.http.put<any>(`${environment.apiUrl}/user/notifications/${n.id}/read`, {}, this.headers).subscribe({
      next: () => {
        n.is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllRead() {
    this.http.put<any>(`${environment.apiUrl}/user/notifications/read-all`, {}, this.headers).subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
        this.unreadCount = 0;
      }
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

  goBack() {
    this.navCtrl.back();
  }
}
