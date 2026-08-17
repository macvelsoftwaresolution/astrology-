import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <header class="app-header">
        <div class="nav-container">
          <div class="logo" routerLink="/">
            <span class="logo-symbol"><i class="bi bi-moon-stars-fill"></i></span>
            <div class="logo-text">
              <span class="tamil-title">ஆருத்ரா ஜோதிடம்</span>
              <span class="english-subtitle">ASTRO DIVINE</span>
            </div>
          </div>
          <nav class="nav-links">
            <a routerLink="/">முகப்பு</a>
            <a routerLink="/panchangam">பஞ்சாங்கம்</a>
            <a routerLink="/zodiac">ராசி பலன்</a>
            <a routerLink="/services" routerLinkActive="active">சேவைகள்</a>
            <a routerLink="/astrologers">ஜோதிடர்கள்</a>
            <a routerLink="/faq">FAQ</a>
          </nav>
          <div class="header-actions">
            <a routerLink="/admin" class="btn-primary">Admin Login</a>
          </div>
        </div>
      </header>

      <main class="page-main-content">
        <section class="services-section">
          <div class="section-container">
            <div class="center-editorial-header">
              <span class="section-eyebrow"><i class="bi bi-gem me-1"></i> OUR SERVICES</span>
              <h2>நாங்கள் வழங்கும் ஜோதிட சேவைகள்</h2>
              <p class="section-desc">TRADITIONAL GUIDANCE &bull; MODERN EXPERIENCE</p>
            </div>

            <!-- Blocked Notice Banner if any dates blocked -->
            <div *ngIf="blockedDates.length > 0" class="date-status-bar" style="background:#fffbeb;border:1px solid #fde68a;padding:10px 16px;border-radius:10px;margin-bottom:24px;display:flex;align-items:center;gap:10px;">
              <span style="font-size:16px;">ℹ️</span>
              <span style="font-size:12px;color:#92400e;font-weight:600;">
                ஜோதிடர் சிறப்பு ஆன்மீக பூஜைகளில் உள்ள தேதிகளில் முன்பதிவு முடக்கப்பட்டுள்ளது. கிடைக்கும் தேதிகளை முன்பதிவு படிவத்தில் தேர்வு செய்யலாம்.
              </span>
            </div>

            <div class="services-cards-grid">
              <div class="service-light-card" *ngFor="let service of services">
                <div class="service-icon-badge">
                  <i [class]="service.iconClass"></i>
                </div>
                <h3>{{ service.title }}</h3>
                <span class="service-subtitle">{{ service.englishTitle }}</span>
                <p>{{ service.description }}</p>
                <div class="service-card-footer">
                  <span class="service-price-tag">கட்டணம்: <strong>{{ service.priceDisplay }}</strong></span>
                  <button type="button" class="btn-primary" style="padding:8px 16px;font-size:12px;" (click)="openBooking(service)">
                    முன்பதிவு செய்க
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- USER SIDE SERVICE BOOKING MODAL -->
      <div *ngIf="selectedService" class="booking-modal-overlay" style="position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;" (click)="selectedService = null">
        <div class="booking-modal-box" style="background:#fff;border-radius:20px;padding:24px;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 45px rgba(0,0,0,0.2);" (click)="$event.stopPropagation()">
          
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f1f5f9;padding-bottom:12px;margin-bottom:16px;">
            <div>
              <h3 style="margin:0;color:#0f172a;font-size:17px;">{{ selectedService.title }}</h3>
              <span style="font-size:12px;color:#b45309;font-weight:700;">கட்டணம்: {{ selectedService.priceDisplay }}</span>
            </div>
            <button type="button" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:50%;width:28px;height:28px;cursor:pointer;" (click)="selectedService = null">✕</button>
          </div>

          <form (ngSubmit)="submitUserBooking()">
            <div style="margin-bottom:12px;">
              <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">உங்கள் பெயர் (Full Name) *</label>
              <input [(ngModel)]="bookingForm.user_name" name="u_name" required style="width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;" placeholder="பெயர் உள்ளிடவும்"/>
            </div>

            <div style="margin-bottom:12px;">
              <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">தொலைபேசி எண் (Phone Number) *</label>
              <input [(ngModel)]="bookingForm.user_phone" name="u_phone" required style="width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;" placeholder="10 இலக்க எண்"/>
            </div>

            <!-- Preferred Date with Live Astrologer Availability Validation -->
            <div style="margin-bottom:12px;">
              <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">விரும்பிய ஆலோசனை தேதி (Preferred Date) *</label>
              <input 
                type="date" 
                [(ngModel)]="bookingForm.preferred_date" 
                name="u_prefdate" 
                required 
                (change)="checkSelectedDate()"
                style="width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;"
              />
              <!-- Blocked Warning -->
              <div *ngIf="selectedDateIsBlocked" style="margin-top:6px;background:#fee2e2;border:1px solid #fecaca;padding:8px 12px;border-radius:8px;color:#b91c1c;font-size:12px;font-weight:600;">
                ⛔ மன்னிக்கவும்! தேர்ந்தெடுக்கப்பட்ட தேதியில் ஜோதிடர் ஆன்மீக நிகழ்வுகளில் இருப்பதால் முன்பதிவு செய்ய இயலாது. மாற்று தேதியை தேர்வு செய்யவும்.
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
              <div>
                <label style="display:block;font-size:11px;font-weight:600;color:#334155;margin-bottom:4px;">பிறந்த தேதி</label>
                <input type="date" [(ngModel)]="bookingForm.dob" name="u_dob" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:12px;"/>
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:600;color:#334155;margin-bottom:4px;">பிறந்த நேரம்</label>
                <input [(ngModel)]="bookingForm.tob" name="u_tob" placeholder="08:30 AM" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:12px;"/>
              </div>
              <div>
                <label style="display:block;font-size:11px;font-weight:600;color:#334155;margin-bottom:4px;">பிறந்த இடம்</label>
                <input [(ngModel)]="bookingForm.pob" name="u_pob" placeholder="சென்னை" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #cbd5e1;border-radius:8px;font-size:12px;"/>
              </div>
            </div>

            <div style="margin-bottom:16px;">
              <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">கேள்விகள் / ஆலோசனை நோக்கம் (Query / Remarks)</label>
              <textarea [(ngModel)]="bookingForm.query" name="u_query" rows="2" style="width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;" placeholder="தொழில், திருமணம், குடும்பம் குறித்த கேள்விகள்..."></textarea>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;">
              <button type="button" style="padding:9px 16px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;cursor:pointer;" (click)="selectedService = null">Cancel</button>
              <button 
                type="submit" 
                class="btn-primary" 
                [disabled]="selectedDateIsBlocked || isSubmitting"
                style="padding:9px 20px;font-size:13px;"
              >
                <span *ngIf="isSubmitting">⏳ பதிவு செய்யப்படுகிறது...</span>
                <span *ngIf="!isSubmitting">✓ முன்பதிவை உறுதிசெய்</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      <!-- SUCCESS CONFIRMATION MODAL -->
      <div *ngIf="bookingSuccessModal" class="booking-modal-overlay" style="position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;">
        <div style="background:#fff;border-radius:20px;padding:28px;width:100%;max-width:440px;text-align:center;box-shadow:0 20px 45px rgba(0,0,0,0.2);">
          <div style="font-size:42px;margin-bottom:10px;">🎉</div>
          <h3 style="margin:0 0 6px 0;color:#0f172a;font-size:20px;">முன்பதிவு வெற்றிகரமாக பதிவு செய்யப்பட்டது!</h3>
          <p style="color:#64748b;font-size:13px;margin:0 0 16px 0;">முன்பதிவு எண்: <strong style="color:#b45309;">{{ confirmedOrderId }}</strong></p>
          <p style="font-size:12px;color:#334155;background:#f8fafc;padding:12px;border-radius:8px;margin-bottom:20px;line-height:1.4;">
            எங்கள் தலைமை ஜோதிடர் குறிப்பிட்ட தேதியில் உங்கள் தொலைபேசி எண்ணிற்கு தொடர்பு கொண்டு துல்லியமான பலன்களை வழங்குவார்.
          </p>
          <button type="button" class="btn-primary" style="padding:10px 24px;" (click)="bookingSuccessModal = false">
            சரி (Done)
          </button>
        </div>
      </div>

      <footer class="app-footer">
        <div class="section-container">
          <div class="footer-bottom-bar">
            <p>&copy; 2026 Astro Divine. All Rights Reserved. Dedicated Services Page.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrl: '../landing/landing.component.css'
})
export class ServicesPageComponent implements OnInit {
  services = [
    { title: 'துல்லியமான ஜாதகக் கணிப்பு', englishTitle: 'DETAILED KUNDALI REPORT', description: 'பாரம்பரிய வேத ஜோதிட முறைப்படி உங்கள் பிறந்த விவரங்களைக் கொண்டு துல்லியமாக கணிக்கப்படும் முழு ஜாதக அறிக்கை.', price: 499, priceDisplay: '₹499', iconClass: 'bi bi-journal-bookmark-fill' },
    { title: 'திருமணப் பொருத்தம் கணித்தல்', englishTitle: 'MARRIAGE MATCHMAKING', description: '10 விதமான பாரம்பரிய திருமணப் பொருத்தங்கள் மற்றும் தோஷ அமைப்புகளை ஆராய்ந்து வழங்கப்படும் துல்லியமான பொருத்தல் அறிக்கை.', price: 299, priceDisplay: '₹299', iconClass: 'bi bi-heart-pulse-fill' },
    { title: 'ஜோதிடர்களுடன் நேரடி ஆலோசனை', englishTitle: 'LIVE CONSULTATION', description: 'எங்கள் முதன்மை வேத ஜோதிடர்களுடன் தொலைபேசி அல்லது ஆடியோ வடிவில் நேரடி சந்தேக நிவர்த்தி ஆலோசனைகள்.', price: 999, priceDisplay: '₹999', iconClass: 'bi bi-person-lines-fill' },
    { title: 'நியூமராலஜி & பெயர் அதிர்ஷ்டம்', englishTitle: 'NUMEROLOGY & NAMING', description: 'உங்கள் பிறந்த தேதி மற்றும் நட்சத்திரத்திற்கு ஏற்ற அதிர்ஷ்டப் பெயர்கள் மற்றும் எண்கணித வழிகாட்டுதல்கள்.', price: 399, priceDisplay: '₹399', iconClass: 'bi bi-123' }
  ];

  blockedDates: string[] = [];
  selectedService: any = null;
  selectedDateIsBlocked = false;
  isSubmitting = false;
  bookingSuccessModal = false;
  confirmedOrderId = '';

  bookingForm = {
    user_name: '',
    user_phone: '',
    preferred_date: new Date().toISOString().split('T')[0],
    dob: '',
    tob: '',
    pob: '',
    query: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchAvailability();
  }

  fetchAvailability(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/availability').subscribe({
      next: (res) => {
        this.blockedDates = res.blocked_dates || [];
        this.checkSelectedDate();
      },
      error: () => {}
    });
  }

  openBooking(service: any): void {
    this.selectedService = service;
    this.bookingForm.preferred_date = new Date().toISOString().split('T')[0];
    this.checkSelectedDate();
  }

  checkSelectedDate(): void {
    if (!this.bookingForm.preferred_date) {
      this.selectedDateIsBlocked = false;
      return;
    }
    this.selectedDateIsBlocked = this.blockedDates.includes(this.bookingForm.preferred_date);
  }

  submitUserBooking(): void {
    if (!this.selectedService) return;
    if (this.selectedDateIsBlocked) {
      alert('மன்னிக்கவும்! தேர்ந்தெடுக்கப்பட்ட தேதியில் முன்பதிவு செய்ய இயலாது.');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      user_name: this.bookingForm.user_name,
      user_phone: this.bookingForm.user_phone,
      service_type: this.selectedService.title,
      price: this.selectedService.price,
      booking_date: this.bookingForm.preferred_date,
      details: {
        dob: this.bookingForm.dob,
        tob: this.bookingForm.tob,
        pob: this.bookingForm.pob,
        preferred_date: this.bookingForm.preferred_date,
        query: this.bookingForm.query
      }
    };

    this.http.post<any>('http://127.0.0.1:8000/api/bookings/create', payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.confirmedOrderId = res.order_id || 'AST-2026';
        this.selectedService = null;
        this.bookingSuccessModal = true;
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'முன்பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
      }
    });
  }
}
