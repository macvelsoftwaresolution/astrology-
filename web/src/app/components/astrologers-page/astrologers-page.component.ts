import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-astrologers-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
            <a routerLink="/services">சேவைகள்</a>
            <a routerLink="/astrologers" routerLinkActive="active">ஜோதிடர்கள்</a>
            <a routerLink="/faq">FAQ</a>
          </nav>
          <div class="header-actions">
            <a [routerLink]="['/']" fragment="download" class="btn-primary">Get App</a>
          </div>
        </div>
      </header>

      <main class="page-main-content">
        <section class="astrologers-section">
          <div class="section-container">
            <div class="center-editorial-header">
              <span class="section-eyebrow"><i class="bi bi-people me-1"></i> CHIEF ASTROLOGERS</span>
              <h2>எங்கள் தலைமை ஜோதிடர்கள்</h2>
              <p class="section-desc">DEEP VEDIC KNOWLEDGE &bull; YEARS OF TRADITIONAL EXPERIENCE</p>
            </div>

            <div class="editorial-astrologers-grid">
              @for (astro of astrologers; track astro.name) {
                <div class="astro-editorial-card">
                  <div class="astro-card-left">
                    <div class="astro-portrait-placeholder">
                      @if (astro.avatar_url) {
                        <img [src]="astro.avatar_url" [alt]="astro.name" class="astro-portrait-img" />
                      } @else {
                        <i [class]="astro.avatar_icon || astro.iconClass || 'bi bi-person-fill'"></i>
                      }
                      <span class="astro-exp-label">{{ astro.experience }}</span>
                    </div>
                  </div>
                  <div class="astro-card-right">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                      <div>
                        <h3 style="margin:0 0 2px 0;">{{ astro.name }}</h3>
                        <span class="astro-editorial-role">{{ astro.role_title || astro.role }}</span>
                      </div>
                    </div>
                    <p class="astro-editorial-bio">"{{ astro.bio }}"</p>
                    <div class="astro-editorial-tags">
                      <strong>நிபுணத்துவம்:</strong>
                      <span>{{ astro.specialty }}</span>
                    </div>
                    <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:11px;color:#15803d;font-weight:700;">
                        {{ astro.status === 'Available' ? '🟢 முன்பதிவுக்கு கிடைக்கும்' : '🔴 விடுப்பில் உள்ளார்' }}
                      </span>
                      <a [routerLink]="['/']" fragment="download" class="btn-astro-consult">
                        ஆலோசனை முன்பதிவு <i class="bi bi-arrow-right-short ms-2"></i>
                      </a>
                    </div>
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
  styleUrl: '../landing/landing.component.css'
})
export class AstrologersPageComponent implements OnInit {
  defaultAstrologers = [
    {
      name: 'குரு ஸ்ரீநிவாசன்',
      role_title: 'தலைமை வேத ஜோதிடர் (ஜாதகம் எழுதுதல்)',
      experience: '25+ ஆண்டுகள் அனுபவம்',
      specialty: 'துல்லிய ஜாதகம் எழுதுதல், திருமணப் பொருத்தம், தோஷ நிவர்த்தி',
      bio: 'வேத ஜோதிடக் கலை பாரம்பரிய குடும்பத்தைச் சேர்ந்தவர். ஆயிரக்கணக்கான குடும்பங்களுக்கு துல்லியமான ஜாதகம் எழுதி வழிகாட்டுதல் வழங்கியுள்ளார்.',
      avatar_icon: 'bi bi-person-fill',
      status: 'Available'
    },
    {
      name: 'குரு ராமஜெயம்',
      role_title: 'முதுநிலை வாஸ்து நிபுணர் (வாஸ்து சாஸ்திரம்)',
      experience: '18+ ஆண்டுகள் அனுபவம்',
      specialty: 'மனை வாஸ்து சாஸ்திரம், வீடு & அலுவலக வாஸ்து பார்வை, வரைபட ஆய்வு',
      bio: 'வாஸ்து சாஸ்திரம் மற்றும் பிரசன்ன ஜோதிடத்தில் 18+ ஆண்டுகள் ஆழ்ந்த அனுபவம் கொண்டவர். எளிய வாஸ்து பரிகாரங்கள் மூலம் தீர்வு வழங்குபவர்.',
      avatar_icon: 'bi bi-person-bounding-box',
      status: 'Available'
    },
    {
      name: 'குரு மீனாட்சி சுந்தரம்',
      role_title: 'எண்கணித வல்லுநர் (நியூமராலஜி & நாடி)',
      experience: '15+ ஆண்டுகள் அனுபவம்',
      specialty: 'அதிர்ஷ்ட பெயர் நியூமராலஜி, தொழில் & வியாபார எண் கணிதம், நாடி பலன்',
      bio: 'எண்கணிதம் (Numerology) மற்றும் நாடி ஜோதிடத்தில் தேர்ச்சி பெற்றவர். தொழில், வேலை மற்றும் குழந்தைகளின் அதிர்ஷ்ட பெயர் தேர்வில் புகழ்பெற்றவர்.',
      avatar_icon: 'bi bi-person-badge',
      status: 'Available'
    }
  ];

  astrologers: any[] = this.defaultAstrologers;
  isLoading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    this.http.get<any>(`${environment.apiUrl}/public/astrologers`).subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res && Array.isArray(res.astrologers) && res.astrologers.length > 0) {
            this.astrologers = res.astrologers;
          } else {
            this.astrologers = this.defaultAstrologers;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => {
        setTimeout(() => {
          this.astrologers = this.defaultAstrologers;
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }
}
