import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
              <span class="english-subtitle">ARUTHRA ASTROLOGY</span>
            </div>
          </div>
          <nav class="nav-links">
            <a routerLink="/">முகப்பு</a>
            <a routerLink="/panchangam">பஞ்சாங்கம்</a>
            <a routerLink="/zodiac">ராசி பலன்</a>
            <a routerLink="/services">சேவைகள்</a>
            <a routerLink="/astrologers" routerLinkActive="active">ஜோதிடர்கள்</a>
            <a routerLink="/testimonials">மதிப்புரைகள்</a>
            <a routerLink="/faq">FAQ</a>
          </nav>
          <div class="header-actions">
            <a routerLink="/" class="btn-primary">Get App</a>
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
              <div class="astro-editorial-card" *ngFor="let astro of astrologers">
                <div class="astro-card-left">
                  <div class="astro-portrait-placeholder">
                    <i [class]="astro.iconClass"></i>
                    <span class="astro-exp-label">{{ astro.experience }}</span>
                  </div>
                </div>
                <div class="astro-card-right">
                  <h3>{{ astro.name }}</h3>
                  <span class="astro-editorial-role">{{ astro.role }}</span>
                  <p class="astro-editorial-bio">"{{ astro.bio }}"</p>
                  <div class="astro-editorial-tags">
                    <strong>நிபுணத்துவம்:</strong>
                    <span>{{ astro.specialty }}</span>
                  </div>
                  <a routerLink="/" class="btn-astro-consult">உரையாடலைத் துவங்கு <i class="bi bi-arrow-right-short ms-2"></i></a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <div class="section-container">
          <div class="footer-bottom-bar">
            <p>&copy; 2026 Aruthra Astrology. All Rights Reserved. Dedicated Astrologers Page.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrl: '../landing/landing.component.css'
})
export class AstrologersPageComponent {
  astrologers = [
    { name: 'குரு ஸ்ரீநிவாசன்', role: 'தலைமை வேத ஜோதிடர்', experience: '25+ ஆண்டுகள் அனுபவம்', specialty: 'ஜாதகக் கணிப்பு, திருமண பொருத்தம், பிரசன்ன ஜோதிடம்', bio: 'வேத ஜோதிடக் கலை பாரம்பரிய குடும்பத்தைச் சேர்ந்தவர். ஆயிரக்கணக்கான குடும்பங்களுக்கு துல்லியமான வழிகாட்டுதல் வழங்கியுள்ளார்.', iconClass: 'bi bi-person-fill' },
    { name: 'குரு ராமஜெயம்', role: 'முதுநிலை பிரசன்ன நிபுணர்', experience: '18+ ஆண்டுகள் அனுபவம்', specialty: 'கேள்வி ஜோதிடம், வாஸ்து சாஸ்திரம், தோஷ நிவாரணம்', bio: 'பிரசன்ன ஜோதிடம் மற்றும் வாஸ்து சாஸ்திரத்தில் ஆழமான ஞானம் கொண்டவர். எளிய பரிகாரங்கள் மூலம் தீர்வு வழங்குபவர்.', iconClass: 'bi bi-person-bounding-box' }
  ];
}
