import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
            <a routerLink="/" class="btn-primary">Get App</a>
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
                <h3 class="panch-large-date">{{ panchangam.date }}</h3>
                <div class="panch-sun-grid">
                  <div class="sun-item">
                    <span class="sun-label"><i class="bi bi-sunrise-fill text-gold me-1"></i> சூரிய உதயம்</span>
                    <strong class="sun-val">{{ panchangam.sunrise }}</strong>
                  </div>
                  <div class="sun-item">
                    <span class="sun-label"><i class="bi bi-sunset-fill text-gold me-1"></i> சூரிய அஸ்தமனம்</span>
                    <strong class="sun-val">{{ panchangam.sunset }}</strong>
                  </div>
                </div>
              </div>

              <div class="panch-right-slots">
                <div class="panch-slot-row">
                  <span class="slot-title">திதி</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value">{{ panchangam.thithi }}</span>
                </div>
                <div class="panch-slot-row">
                  <span class="slot-title">நட்சத்திரம்</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value">{{ panchangam.star }}</span>
                </div>
                <div class="panch-slot-row">
                  <span class="slot-title">நல்ல நேரம்</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value text-green">{{ panchangam.nallaNeram }}</span>
                </div>
                <div class="panch-slot-row">
                  <span class="slot-title">இராகு காலம்</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value text-red">{{ panchangam.rahukalam }}</span>
                </div>
                <div class="panch-slot-row">
                  <span class="slot-title">எமகண்டம்</span>
                  <div class="slot-divider"></div>
                  <span class="slot-value text-orange">{{ panchangam.yamagandam }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <div class="section-container">
          <div class="footer-bottom-bar">
            <p>&copy; 2026 Astro Divine. All Rights Reserved. Dedicated Panchangam Page.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrl: '../landing/landing.component.css'
})
export class PanchangamPageComponent {
  panchangam = {
    date: '10 ஆகஸ்ட் 2026, திங்கள்',
    sunrise: '06:05 AM',
    sunset: '06:35 PM',
    thithi: 'ஏகாதசி (Ekadashi) - மாலை 04:30 PM வரை, பின்னர் துவாதசி',
    star: 'ரோகிணி (Rohini) - இரவு 09:15 PM வரை, பின்னர் மிருகசீரிடம்',
    nallaNeram: 'காலை 06:15 AM - 07:15 AM, மாலை 04:45 PM - 05:45 PM',
    rahukalam: 'காலை 07:30 AM - 09:00 AM',
    yamagandam: 'மதியம் 01:30 PM - 03:00 PM'
  };
}
