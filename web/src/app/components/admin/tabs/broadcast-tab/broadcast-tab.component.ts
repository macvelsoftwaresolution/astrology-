import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-broadcast-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './broadcast-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './broadcast-tab.component.css']
})
export class BroadcastTabComponent implements OnInit {
  dailyNotifEnabled = true;
  dailyNotifOptedInCount = 0;
  dailyNotifLoading = false;

  showCreateForm = false; // Toggle view: false = History Table, true = Create Form

  broadcastHistory: any[] = [];
  isLoadingHistory = false;

  broadcastForm = {
    target: 'all',
    type: 'general',
    user_id: null,
    title: '',
    body: ''
  };
  broadcastMsg = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadNotificationStatus();
      this.loadBroadcastHistory();
    }
  }

  loadNotificationStatus(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/notifications/daily-rasi-status`, headers).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.dailyNotifEnabled = res.enabled ?? true;
          this.dailyNotifOptedInCount = res.opted_in_users ?? 0;
          this.cdr.markForCheck();
        }, 0);
      },
      error: () => { }
    });
  }

  loadBroadcastHistory(): void {
    this.isLoadingHistory = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/notifications/broadcast-history`, headers).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.broadcastHistory = res.history || [];
          this.isLoadingHistory = false;
          this.cdr.markForCheck();
        }, 0);
      },
      error: () => {
        setTimeout(() => {
          this.isLoadingHistory = false;
          this.cdr.markForCheck();
        }, 0);
      }
    });
  }

  toggleDailyRasiNotification(): void {
    if (this.dailyNotifLoading) return;

    // Optimistic Instant UI Update (0ms Delay)
    const targetStatus = !this.dailyNotifEnabled;
    this.dailyNotifEnabled = targetStatus;
    this.dailyNotifLoading = true;
    this.cdr.markForCheck();

    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/notifications/daily-rasi-toggle`, { enabled: targetStatus }, headers).subscribe({
      next: (res) => {
        this.dailyNotifEnabled = res.enabled;
        this.dailyNotifLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        // Revert back on error
        this.dailyNotifEnabled = !targetStatus;
        this.dailyNotifLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  sendBroadcast(): void {
    if (!this.broadcastForm.title || !this.broadcastForm.body) {
      alert('தலைப்பு மற்றும் விவரங்களை உள்ளிடவும்.');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/notifications/broadcast`, this.broadcastForm, headers).subscribe({
      next: (res) => {
        this.broadcastMsg = res.message || '✅ புஷ் அறிவிப்பு வெற்றிகரமாக அனுப்பப்பட்டது!';
        this.broadcastForm.title = '';
        this.broadcastForm.body = '';
        this.loadBroadcastHistory();
        setTimeout(() => {
          this.broadcastMsg = '';
          this.showCreateForm = false; // Switch back to History List
          this.cdr.markForCheck();
        }, 1000);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.broadcastMsg = '❌ அறிவிப்பை அனுப்புவதில் பிழை ஏற்பட்டது: ' + (err?.error?.message || 'Server error');
        this.cdr.markForCheck();
      }
    });
  }
}
