import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-panchangam-page',
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
            <a routerLink="/panchangam" routerLinkActive="active">பஞ்சாங்கம்</a>
            <a routerLink="/zodiac">ராசி பலன்</a>
            <a routerLink="/services">சேவைகள்</a>
            <a routerLink="/astrologers">ஜோதிடர்கள்</a>
            <a routerLink="/faq">FAQ</a>
          </nav>
          <div class="header-actions">
            <a [routerLink]="['/']" fragment="download" class="btn-primary">Get App</a>
          </div>
        </div>
      </header>

      <main class="page-main-content">
        <section class="live-panchangam-section">
          <div class="section-container">
            <div class="panch-editorial-header text-center">
              <span class="section-eyebrow"><i class="bi bi-calendar3 me-1"></i> ALMANAC DASHBOARD</span>
              <h2>இன்றைய பஞ்சாங்கம்</h2>
              <p class="section-desc">TODAY'S PANCHANGAM &bull; ACCURATE VEDIC TIMINGS</p>
            </div>

            <div class="panchangam-dashboard">
              <div class="panch-left-hero">
                <span class="panch-large-label">இன்றைய தேதி</span>
                <h3 class="panch-large-date">{{ panchangam.date || '-' }}</h3>
              </div>

              <div class="panch-right-slots">
                <div class="panch-slot-row">
                  <span class="slot-title">திதி</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value">{{ panchangam.thithi || '-' }}</span>
                </div>
                <div class="panch-slot-row">
                  <span class="slot-title">நட்சத்திரம்</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value">{{ panchangam.star || '-' }}</span>
                </div>
                <div class="panch-slot-row">
          <span class="slot-title">நல்ல நேரம்</span>
          <div class="slot-divider"></div>
          <div class="nalla-sessions-pills">
            @if (panchangam.nallaMorning) {
              <span class="nalla-pill morning">
                <i class="bi bi-sun-fill"></i> காலை: {{ panchangam.nallaMorning }}
              </span>
            }
            @if (panchangam.nallaEvening) {
              <span class="nalla-pill evening">
                <i class="bi bi-sunset-fill"></i> மாலை: {{ panchangam.nallaEvening }}
              </span>
            }
            @if (!panchangam.nallaMorning && !panchangam.nallaEvening) {
              <span class="slot-value text-green">{{ panchangam.nallaNeram || '-' }}</span>
            }
          </div>
        </div>
                <div class="panch-slot-row">
                  <span class="slot-title">இராகு காலம்</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value text-red">{{ panchangam.rahukalam || '-' }}</span>
                </div>
                <div class="panch-slot-row">
                  <span class="slot-title">எமகண்டம்</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value text-orange">{{ panchangam.yamagandam || '-' }}</span>
                </div>
              </div>
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
export class PanchangamPageComponent implements OnInit {
  panchangam = {
    date: '',
    sunrise: '',
    sunset: '',
    thithi: '',
    star: '',
    nallaNeram: '',
    nallaMorning: '',
    nallaEvening: '',
    rahukalam: '',
    yamagandam: ''
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLivePanchangam();
  }

  parseNallaSessions(val: string): { morning: string; evening: string } {
    if (!val) return { morning: '', evening: '' };
    const sessions = val.split('/');
    let morning = '';
    let evening = '';
    if (sessions[0]) {
      morning = sessions[0].replace(/\(.*?\)/g, '').trim();
    }
    if (sessions[1]) {
      evening = sessions[1].replace(/\(.*?\)/g, '').trim();
    }
    return { morning, evening };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const monthsTamil = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
      const daysTamil = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
      const dayNum = d.getDate();
      const monthTamil = monthsTamil[d.getMonth()];
      const yearNum = d.getFullYear();
      const dayName = daysTamil[d.getDay()];
      return `${dayNum} ${monthTamil} ${yearNum}, ${dayName}`;
    } catch {
      return dateStr;
    }
  }

  loadLivePanchangam(): void {
    if (typeof window === 'undefined') return;
    this.http.get<any>(`${environment.apiUrl}/panchangam/today`).subscribe({
      next: (res) => {
        if (res && res.panchangam) {
          const p = res.panchangam;
          let nalla = p.nalla_neram || p.nallaNeram || '';
          nalla = nalla.replace(/Morning/gi, 'காலை').replace(/Evening/gi, 'மாலை');
          const sessions = this.parseNallaSessions(p.nalla_neram || p.nallaNeram || '');
          this.panchangam = {
            date: p.date ? this.formatDate(p.date) : '',
            thithi: p.thithi || '',
            star: p.star || '',
            nallaNeram: nalla,
            nallaMorning: sessions.morning,
            nallaEvening: sessions.evening,
            rahukalam: p.rahukalam || '',
            yamagandam: p.yamagandam || '',
            sunrise: p.sunrise || '',
            sunset: p.sunset || ''
          };
        } else {
          this.panchangam = {
            date: '',
            sunrise: '',
            sunset: '',
            thithi: '',
            star: '',
            nallaNeram: '',
            nallaMorning: '',
            nallaEvening: '',
            rahukalam: '',
            yamagandam: ''
          };
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}
