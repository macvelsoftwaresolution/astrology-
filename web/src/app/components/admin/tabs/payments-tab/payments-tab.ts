import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payments-tab',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './payments-tab.html',
  styleUrls: ['../../admin-dashboard.css', './payments-tab.css']
})
export class PaymentsTabComponent implements OnInit {
  paymentTransactions: any[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadPayments();
    }
  }

  loadPayments(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/payment-transactions`, headers).subscribe({
      next: (res) => {
        this.paymentTransactions = res.payments || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatPaymentType(type: string): string {
    const isTa = this.translationService.currentLanguage() === 'ta';
    const clean = (type || '').toLowerCase();

    if (!clean || clean.includes('astrology')) {
      return isTa ? 'ஜோதிட சேவை' : 'Astrology Service';
    }
    if (clean.includes('course') || clean.includes('lms') || clean.includes('admission')) {
      return isTa ? 'கல்விக் கட்டணம்' : 'Course Fee';
    }
    if (clean.includes('book')) {
      return isTa ? 'புத்தக ஆர்டர்' : 'Book Order';
    }
    if (clean.includes('matrimony')) {
      return isTa ? 'சுயவரப் பதிவு' : 'Matrimony Registration';
    }
    return this.translationService.translateDynamic(type);
  }

  formatStatus(status: string): string {
    const isTa = this.translationService.currentLanguage() === 'ta';
    const clean = (status || 'Paid').toLowerCase();

    if (clean === 'paid' || clean === 'success' || clean === 'captured') {
      return isTa ? 'செலுத்தப்பட்டது' : 'Paid';
    }
    if (clean === 'pending' || clean === 'created') {
      return isTa ? 'காத்திருப்பில்' : 'Pending';
    }
    if (clean === 'failed') {
      return isTa ? 'தோல்வி' : 'Failed';
    }
    if (clean === 'refunded') {
      return isTa ? 'திரும்பப் பெறப்பட்டது' : 'Refunded';
    }
    return isTa ? 'செலுத்தப்பட்டது' : 'Paid';
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
