import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-services-page',
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
            <a routerLink="/services" routerLinkActive="active">சேவைகள்</a>
            <a routerLink="/astrologers">ஜோதிடர்கள்</a>
            <a routerLink="/faq">FAQ</a>
          </nav>
          <div class="header-actions">
            <a routerLink="/" class="btn-primary">Get App</a>
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

            <div class="services-cards-grid">
              <div class="service-light-card" *ngFor="let service of services">
                <div class="service-icon-badge">
                  <i [class]="service.iconClass"></i>
                </div>
                <h3>{{ service.title }}</h3>
                <span class="service-subtitle">{{ service.englishTitle }}</span>
                <p>{{ service.description }}</p>
                <div class="service-card-footer">
                  <span class="service-price-tag">கட்டணம்: <strong>{{ service.price }}</strong></span>
                  <a routerLink="/" class="btn-service-action"><i class="bi bi-arrow-right-circle-fill"></i></a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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
export class ServicesPageComponent {
  services = [
    { title: 'துல்லியமான ஜாதகக் கணிப்பு', englishTitle: 'DETAILED KUNDALI REPORT', description: 'பாரம்பரிய வேத ஜோதிட முறைப்படி உங்கள் பிறந்த விவரங்களைக் கொண்டு துல்லியமாக கணிக்கப்படும் முழு ஜாதக அறிக்கை.', price: '₹499', iconClass: 'bi bi-journal-bookmark-fill' },
    { title: 'திருமணப் பொருத்தம் கணித்தல்', englishTitle: 'MARRIAGE MATCHMAKING', description: '10 விதமான பாரம்பரிய திருமணப் பொருத்தங்கள் மற்றும் தோஷ அமைப்புகளை ஆராய்ந்து வழங்கப்படும் துல்லியமான பொருத்தல் அறிக்கை.', price: '₹299', iconClass: 'bi bi-heart-pulse-fill' },
    { title: 'ஜோதிடர்களுடன் நேரடி ஆலோசனை', englishTitle: 'LIVE CONSULTATION', description: 'எங்கள் முதன்மை வேத ஜோதிடர்களுடன் தொலைபேசி அல்லது ஆடியோ வடிவில் நேரடி சந்தேக நிவர்த்தி ஆலோசனைகள்.', price: '₹999', iconClass: 'bi bi-person-lines-fill' },
    { title: 'நியூமராலஜி & பெயர் அதிர்ஷ்டம்', englishTitle: 'NUMEROLOGY & NAMING', description: 'உங்கள் பிறந்த தேதி மற்றும் நட்சத்திரத்திற்கு ஏற்ற அதிர்ஷ்டப் பெயர்கள் மற்றும் எண்கணித வழிகாட்டுதல்கள்.', price: '₹399', iconClass: 'bi bi-123' }
  ];
}
