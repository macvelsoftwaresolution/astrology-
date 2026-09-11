import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-broadcast-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './broadcast-tab.html',
  styleUrls: ['../../admin-dashboard.css', './broadcast-tab.css']
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
    private toastService: ToastService,
    public translationService: TranslationService,
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
      this.toastService.warning('தலைப்பு மற்றும் விவரங்களை உள்ளிடவும்.', 'விவரங்கள் தேவை');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/notifications/broadcast`, this.broadcastForm, headers).subscribe({
      next: (res) => {
        this.broadcastMsg = res.message || 'புஷ் அறிவிப்பு வெற்றிகரமாக அனுப்பப்பட்டது!';
        this.toastService.success(this.broadcastMsg, 'அறிவிப்பு அனுப்பப்பட்டது');
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
        const errMsg = 'அறிவிப்பை அனுப்புவதில் பிழை ஏற்பட்டது: ' + (err?.error?.message || 'Server error');
        this.broadcastMsg = errMsg;
        this.toastService.error(errMsg, 'பிழை');
        this.cdr.markForCheck();
      }
    });
  }
  stripEmojis(str: string): string {
    if (!str) return '';
    return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE00}-\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
  }

  getNotificationIcon(type: string): string {
    const t = (type || '').toLowerCase();
    const icons: Record<string, string> = {
      seminar: 'bi-mic-fill',
      course: 'bi-camera-video-fill',
      live_class: 'bi-broadcast',
      booking: 'bi-calendar2-check-fill',
      astrology_booking: 'bi-calendar2-check-fill',
      user: 'bi-person-check-fill',
      user_registration: 'bi-person-plus-fill',
      book_order: 'bi-box-seam-fill',
      marriage: 'bi-heart-fill',
      matrimony: 'bi-heart-fill',
      marriage_match: 'bi-heart-fill',
      rasi_palan: 'bi-stars',
      certificate: 'bi-award-fill',
      payment: 'bi-credit-card-fill',
      general: 'bi-bell-fill'
    };
    return icons[t] || 'bi-bell-fill';
  }

  getNotificationColor(type: string): string {
    const t = (type || '').toLowerCase();
    const colors: Record<string, string> = {
      seminar: '#8b5cf6',
      course: '#ef4444',
      live_class: '#ef4444',
      booking: '#2563eb',
      astrology_booking: '#2563eb',
      user: '#10b981',
      user_registration: '#10b981',
      book_order: '#0891b2',
      marriage: '#f43f5e',
      matrimony: '#f43f5e',
      marriage_match: '#f43f5e',
      rasi_palan: '#f59e0b',
      certificate: '#d97706',
      payment: '#059669',
      general: '#d97706'
    };
    return colors[t] || '#d97706';
  }

  formatNotificationTitle(title: string): string {
    if (!title) return '';
    let clean = this.stripEmojis(title);
    const isTa = this.translationService.currentLanguage() === 'ta';
    if (isTa) {
      // PURE TAMIL MODE
      clean = clean.replace(/\s*\([A-Za-z\s0-9#\-_:]+\)/g, '').trim();
      if (clean.includes('Exam Submitted')) return 'தேர்வு சமர்ப்பிக்கப்பட்டது';
      if (clean.includes('Re-Exam Scheduled')) return 'மறுதேர்வு திட்டமிடப்பட்டது';
      if (clean.includes('Exam Submission')) return 'தேர்வு சமர்ப்பிப்பு';
      if (clean.includes('Booking Completed')) return 'முன்பதிவு நிறைவுற்றது';
      if (clean.includes('Booking Received')) return 'முன்பதிவு பெறப்பட்டது';
      if (clean.includes('Book Order Received')) return 'புத்தக ஆர்டர் பெறப்பட்டது';
      clean = clean.replace(/புத்தக ஆர்டர் நிலை:\s*Shipped/gi, 'புத்தக ஆர்டர் நிலை: அனுப்பி வைக்கப்பட்டது')
                   .replace(/புத்தக ஆர்டர் நிலை:\s*Packed/gi, 'புத்தக ஆர்டர் நிலை: பேக் செய்யப்பட்டது')
                   .replace(/புத்தக ஆர்டர் நிலை:\s*Processing/gi, 'புத்தக ஆர்டர் நிலை: செயலாக்கத்தில் உள்ளது')
                   .replace(/புத்தக ஆர்டர் நிலை:\s*Delivered/gi, 'புத்தக ஆர்டர் நிலை: விநியோகிக்கப்பட்டது');
      return clean;
    } else {
      // PURE ENGLISH MODE
      if (clean.includes('தேர்வு முடிவு & சான்றிதழ் வெளியிடப்பட்டது') || clean.includes('தேர்வு முடிவு')) {
        return 'Exam Results & Certificate Published!';
      }
      if (clean.includes('தேர்வு சமர்ப்பிக்கப்பட்டது') || clean.includes('Exam Submitted')) {
        return 'Exam Submitted';
      }
      if (clean.includes('மறுதேர்வு திட்டமிடப்பட்டது') || clean.includes('Re-Exam Scheduled')) {
        return 'Re-Exam Scheduled';
      }
      if (clean.includes('Booking Completed') || clean.includes('முன்பதிவு நிறைவுற்றது')) {
        return 'Booking Completed!';
      }
      if (clean.includes('Booking Received') || clean.includes('முன்பதிவு பெறப்பட்டது')) {
        return 'Booking Received!';
      }
      if (clean.includes('புத்தக ஆர்டர் நிலை')) {
        return clean.replace(/புத்தக ஆர்டர் நிலை:\s*அனுப்பி வைக்கப்பட்டது/gi, 'Book Order Status: Shipped')
                    .replace(/புத்தக ஆர்டர் நிலை:\s*பேக் செய்யப்பட்டது/gi, 'Book Order Status: Packed')
                    .replace(/புத்தக ஆர்டர் நிலை:\s*செயலாக்கத்தில் உள்ளது/gi, 'Book Order Status: Processing')
                    .replace(/புத்தக ஆர்டர் நிலை:\s*விநியோகிக்கப்பட்டது/gi, 'Book Order Status: Delivered')
                    .replace(/புத்தக ஆர்டர் நிலை:\s*/gi, 'Book Order Status: ');
      }
      if (clean.includes('புத்தக ஆர்டர் பெறப்பட்டது')) {
        return 'Book Order Received!';
      }
      return clean;
    }
  }

  formatNotificationBody(body: string): string {
    if (!body) return '';
    let clean = this.stripEmojis(body);
    const isTa = this.translationService.currentLanguage() === 'ta';
    if (isTa) {
      // PURE TAMIL MODE
      clean = clean.replace(/நிலை:\s*Shipped/gi, 'நிலை: அனுப்பி வைக்கப்பட்டது')
                   .replace(/நிலை:\s*Packed/gi, 'நிலை: பேக் செய்யப்பட்டது')
                   .replace(/நிலை:\s*Processing/gi, 'நிலை: செயலாக்கத்தில் உள்ளது')
                   .replace(/நிலை:\s*Delivered/gi, 'நிலை: விநியோகிக்கப்பட்டது');
      if (clean.includes('Your exam answer sheet was submitted successfully')) {
        return 'உங்கள் தேர்வு விடைத்தாள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. விரைவில் மதிப்பீடு செய்யப்படும்.';
      }
      if (clean.includes('Your exam results and certificate')) {
        return 'உங்கள் தேர்வு முடிவுகள் மற்றும் சான்றிதழ் / மதிப்பெண் பட்டியல் வெளியிடப்பட்டுள்ளது. "My Certificates" பகுதியில் பார்வையிட்டு பதிவிறக்கம் செய்துகொள்ளலாம்.';
      }
      return clean;
    } else {
      // PURE ENGLISH MODE
      if (clean.includes('உங்கள் தேர்வு முடிவுகள் மற்றும் சான்றிதழ்') || clean.includes('My Certificates')) {
        return 'Your exam results and certificate / marksheet have been published. You can view and download them in the "My Certificates" section.';
      }
      if (clean.includes('உங்கள் தேர்வு விடைத்தாள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது') || clean.includes('மதிப்பீடு செய்யப்படும்')) {
        return 'Your exam answer sheet was submitted successfully. It will be evaluated shortly.';
      }
      if (clean.includes('மறுதேர்வுக்கான அனுமதி வழங்கப்பட்டது')) {
        return 'Permission for re-examination has been granted. You can take the exam at the scheduled time.';
      }
      if (clean.includes('உங்கள் முன்பதிவு') && clean.includes('ஆய்வு செய்யப்பட்டு')) {
        return 'Your booking has been reviewed and completed by the astrologer. Your horoscope chart file is attached.';
      }
      if (clean.includes('உங்கள்') && clean.includes('முன்பதிவு') && clean.includes('பெறப்பட்டது')) {
        return 'Your booking request has been received.';
      }
      if (clean.includes('புத்தக ஆர்டர்')) {
        return clean.replace(/உங்கள் புத்தக ஆர்டர் நிலை:\s*அனுப்பி வைக்கப்பட்டது/gi, 'Your book order status: Shipped')
                    .replace(/உங்கள் புத்தக ஆர்டர் நிலை:\s*பேக் செய்யப்பட்டது/gi, 'Your book order status: Packed')
                    .replace(/உங்கள் புத்தக ஆர்டர் நிலை:\s*செயலாக்கத்தில் உள்ளது/gi, 'Your book order status: Processing')
                    .replace(/உங்கள் புத்தக ஆர்டர் நிலை:\s*விநியோகிக்கப்பட்டது/gi, 'Your book order status: Delivered');
      }
      return clean;
    }
  }

  formatDate(rawDate: any): string {
    if (!rawDate) return '';
    try {
      const isTa = this.translationService.currentLanguage() === 'ta';
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate);

      const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayNamesTa = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
      const monthNamesTa = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];

      const dateNum = d.getDate().toString().padStart(2, '0');
      const monthStr = isTa ? monthNamesTa[d.getMonth()] : monthNamesEn[d.getMonth()];
      const yearStr = d.getFullYear();

      let hours = d.getHours();
      const isPm = hours >= 12;
      const minutes = d.getMinutes().toString().padStart(2, '0');
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = hours.toString().padStart(2, '0');

      const ampmStr = isTa ? (isPm ? 'பிற்பகல்' : 'முற்பகல்') : (isPm ? 'PM' : 'AM');

      return `${dateNum} ${monthStr} ${yearStr}, ${hoursStr}:${minutes} ${ampmStr}`;
    } catch {
      return String(rawDate);
    }
  }
}
