import { environment } from '../../../environments/environment';
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
            <a [routerLink]="['/']" fragment="download" class="btn-primary">Get App</a>
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
            @if (blockedDates.length > 0) {
              <div class="date-status-bar" style="background:#fffbeb;border:1px solid #fde68a;padding:10px 16px;border-radius:10px;margin-bottom:24px;display:flex;align-items:center;gap:10px;">
                <span style="font-size:16px;">ℹ️</span>
                <span style="font-size:12px;color:#92400e;font-weight:600;">
                  ஜோதிடர் சிறப்பு ஆன்மீக பூஜைகளில் உள்ள தேதிகளில் முன்பதிவு முடக்கப்பட்டுள்ளது. கிடைக்கும் தேதிகளை முன்பதிவு படிவத்தில் தேர்வு செய்யலாம்.
                </span>
              </div>
            }

            <div class="services-cards-grid">
              @for (service of services; track service.title) {
                <div class="service-light-card">
                  <div class="service-icon-badge">
                    <i [class]="service.iconClass"></i>
                  </div>
                  <h3>{{ service.title }}</h3>
                  <span class="service-subtitle">{{ service.englishTitle }}</span>
                  <p>{{ service.description }}</p>
                  <div class="service-card-footer" style="display:flex;justify-content:flex-end;">
                    <a [routerLink]="['/']" fragment="download" class="btn-primary-luxury" style="padding:0.7rem 1.5rem;font-size:0.88rem;white-space:nowrap;">
                      முன்பதிவு செய்க <i class="bi bi-arrow-right-short ms-1"></i>
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <div class="section-container">
          <div class="footer-grid-layout">
            <div class="footer-brand-column">
              <div class="footer-brand-title">
                <span class="brand-icon-halo"><i class="bi bi-moon-stars-fill text-gold"></i></span>
                <div class="brand-text-stack">
                  <span class="tamil-brand">ஆருத்ரா ஜோதிடம்</span>
                  <span class="english-brand">ASTRO DIVINE</span>
                </div>
              </div>
              <p class="footer-brand-desc">
                பாரம்பரிய தென் இந்திய வேத கணித முறைப்படி கணிக்கப்படும் 100% துல்லியமான ஆன்லைன் ஜோதிடச் சேவைத் தளம்.
              </p>
              <div class="footer-social-row">
                <a href="#" (click)="$event.preventDefault()" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
                <a href="#" (click)="$event.preventDefault()" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
                <a href="#" (click)="$event.preventDefault()" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                <a href="#" (click)="$event.preventDefault()" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              </div>
            </div>

            <div class="footer-links-column">
              <h4>எங்களது சேவைகள்</h4>
              <div class="footer-links-list">
                <a routerLink="/services"><i class="bi bi-chevron-right me-1 fs-xs"></i> ஜாதகக் கணிப்பு</a>
                <a routerLink="/services"><i class="bi bi-chevron-right me-1 fs-xs"></i> திருமணப் பொருத்தம்</a>
                <a routerLink="/astrologers"><i class="bi bi-chevron-right me-1 fs-xs"></i> நேரடி ஆலோசனை</a>
              </div>
            </div>

            <div class="footer-links-column">
              <h4>விரைவு இணைப்புகள்</h4>
              <div class="footer-links-list">
                <a routerLink="/"><i class="bi bi-chevron-right me-1 fs-xs"></i> முகப்பு</a>
                <a routerLink="/panchangam"><i class="bi bi-chevron-right me-1 fs-xs"></i> பஞ்சாங்கம்</a>
                <a routerLink="/zodiac"><i class="bi bi-chevron-right me-1 fs-xs"></i> ராசி பலன்</a>
                <a routerLink="/faq"><i class="bi bi-chevron-right me-1 fs-xs"></i> FAQ</a>
              </div>
            </div>

            <div class="footer-contact-column">
              <h4>தொடர்புகொள்ள</h4>
              <div class="contact-info-list">
                <p><i class="bi bi-telephone-fill text-gold me-2"></i> +91 98765 43210</p>
                <p><i class="bi bi-envelope-fill text-gold me-2"></i> support&#64;astrodivine.com</p>
                <p><i class="bi bi-geo-alt-fill text-gold me-2"></i> சென்னை, தமிழ்நாடு.</p>
              </div>
            </div>
          </div>

          <div class="footer-bottom-bar">
            <div class="footer-bottom-left">
              <p class="copyright-text">&copy; 2026 Astro Divine. All Rights Reserved.</p>
              <span class="developer-credit">
                Designed & Developed by <strong class="macvel-brand-highlight">Macvel Software Solutions</strong>
              </span>
            </div>
            <div class="footer-legal-links">
              <a href="#" (click)="$event.preventDefault()">தனியுரிமைக் கொள்கை (Privacy Policy)</a>
              <a href="#" (click)="$event.preventDefault()">விதிமுறைகள் (Terms)</a>
              <a href="#" (click)="$event.preventDefault()">உதவி மையம் (Support)</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrl: '../landing/landing.css'
})
export class ServicesPageComponent implements OnInit {
  services = [
    { title: 'துல்லியமான ஜாதகக் கணிப்பு', englishTitle: 'DETAILED KUNDALI REPORT', description: 'பாரம்பரிய வேத ஜோதிட முறைப்படி உங்கள் பிறந்த விவரங்களைக் கொண்டு துல்லியமாக கணிக்கப்படும் முழு ஜாதக அறிக்கை.', price: 499, priceDisplay: '₹499', iconClass: 'bi bi-journal-bookmark-fill' },
    { title: 'திருமணப் பொருத்தம் கணித்தல்', englishTitle: 'MARRIAGE MATCHMAKING', description: '10 விதமான பாரம்பரிய திருமணப் பொருத்தங்கள் மற்றும் தோஷ அமைப்புகளை ஆராய்ந்து வழங்கப்படும் துல்லியமான பொருத்தல் அறிக்கை.', price: 299, priceDisplay: '₹299', iconClass: 'bi bi-heart-pulse-fill' },
    { title: 'ஜோதிடர்களுடன் நேரடி ஆலோசனை', englishTitle: 'LIVE CONSULTATION', description: 'எங்கள் முதன்மை வேத ஜோதிடர்களுடன் தொலைபேசி அல்லது ஆடியோ வடிவில் நேரடி சந்தேக நிவர்த்தி ஆலோசனைகள்.', price: 999, priceDisplay: '₹999', iconClass: 'bi bi-person-lines-fill' },
    { title: 'நியூமராலஜி & பெயர் அதிர்ஷ்டம்', englishTitle: 'NUMEROLOGY & NAMING', description: 'உங்கள் பிறந்த தேதி மற்றும் நட்சத்திரத்திற்கு ஏற்ற அதிர்ஷ்டப் பெயர்கள் மற்றும் எண்கணித வழிகாட்டுதல்கள்.', price: 399, priceDisplay: '₹399', iconClass: 'bi bi-123' }
  ];

  astrologers: any[] = [];
  selectedAstrologer: any = null;
  blockedDates: string[] = [];
  selectedService: any = null;
  selectedDateIsBlocked = false;
  isSubmitting = false;
  bookingSuccessModal = false;
  confirmedOrderId = '';
  confirmedAstrologerName = '';

  bookingForm = {
    user_name: '',
    user_phone: '',
    preferred_date: new Date().toISOString().split('T')[0],
    time_slot: '10:00 AM - 11:00 AM',
    dob: '',
    tob: '',
    pob: '',
    query: ''
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchAstrologers();
    this.fetchAvailability();
  }

  fetchAstrologers(): void {
    this.http.get<any>(`${environment.apiUrl}/public/astrologers`).subscribe({
      next: (res) => {
        this.astrologers = res.astrologers || [];
        if (this.astrologers.length > 0) {
          this.selectedAstrologer = this.astrologers[0];
          if (this.selectedAstrologer.available_slots && this.selectedAstrologer.available_slots.length > 0) {
            this.bookingForm.time_slot = this.selectedAstrologer.available_slots[0];
          }
        }
        this.checkSelectedDate();
      },
      error: () => {
        this.astrologers = [];
      }
    });
  }

  fetchAvailability(): void {
    this.http.get<any>(`${environment.apiUrl}/availability`).subscribe({
      next: (res) => {
        this.blockedDates = res.blocked_dates || [];
        this.checkSelectedDate();
      },
      error: () => { }
    });
  }

  selectAstrologer(astro: any): void {
    this.selectedAstrologer = astro;
    if (astro.available_slots && astro.available_slots.length > 0) {
      this.bookingForm.time_slot = astro.available_slots[0];
    }
    this.checkSelectedDate();
  }

  getAvailableSlots(): string[] {
    if (this.selectedAstrologer && this.selectedAstrologer.available_slots && this.selectedAstrologer.available_slots.length > 0) {
      return this.selectedAstrologer.available_slots;
    }
    return ['10:00 AM - 11:00 AM', '11:30 AM - 12:30 PM', '04:00 PM - 05:00 PM', '06:00 PM - 07:00 PM'];
  }

  getCurrentPrice(): number {
    if (this.selectedAstrologer && this.selectedAstrologer.fee) {
      return Number(this.selectedAstrologer.fee);
    }
    return this.selectedService ? Number(this.selectedService.price) : 499;
  }

  openBooking(service: any): void {
    this.selectedService = service;
    this.bookingForm.preferred_date = new Date().toISOString().split('T')[0];
    if (this.selectedAstrologer && this.selectedAstrologer.available_slots && this.selectedAstrologer.available_slots.length > 0) {
      this.bookingForm.time_slot = this.selectedAstrologer.available_slots[0];
    }
    this.checkSelectedDate();
  }

  checkSelectedDate(): void {
    if (!this.bookingForm.preferred_date) {
      this.selectedDateIsBlocked = false;
      return;
    }
    const curDate = this.bookingForm.preferred_date;
    const astroBlocked = this.selectedAstrologer?.blocked_dates || [];
    this.selectedDateIsBlocked = astroBlocked.includes(curDate) || this.blockedDates.includes(curDate);
  }

  submitUserBooking(): void {
    if (!this.selectedService) return;
    if (this.selectedDateIsBlocked) {
      alert('மன்னிக்கவும்! தேர்ந்தெடுக்கப்பட்ட தேதியில் ஜோதிடர் விடுப்பில் உள்ளார். மாற்று தேதியை தேர்வு செய்யவும்.');
      return;
    }

    this.isSubmitting = true;
    const finalPrice = this.getCurrentPrice();

    const payload = {
      user_name: this.bookingForm.user_name,
      user_phone: this.bookingForm.user_phone,
      service_type: this.selectedService.title,
      price: finalPrice,
      booking_date: this.bookingForm.preferred_date,
      details: {
        astrologer_name: this.selectedAstrologer?.name || 'முதன்மை ஜோதிடர்',
        astrologer_id: this.selectedAstrologer?.id || 1,
        time_slot: this.bookingForm.time_slot,
        dob: this.bookingForm.dob,
        tob: this.bookingForm.tob,
        pob: this.bookingForm.pob,
        preferred_date: this.bookingForm.preferred_date,
        query: this.bookingForm.query
      }
    };

    this.http.post<any>(`${environment.apiUrl}/bookings/create`, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.confirmedOrderId = res.order_id || 'AST-2026';
        this.confirmedAstrologerName = this.selectedAstrologer?.name || '';
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
