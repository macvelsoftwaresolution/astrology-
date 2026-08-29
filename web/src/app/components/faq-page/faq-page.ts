import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faq-page',
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
            <a routerLink="/astrologers">ஜோதிடர்கள்</a>
            <a routerLink="/faq" routerLinkActive="active">FAQ</a>
          </nav>
          <div class="header-actions">
            <a [routerLink]="['/']" fragment="download" class="btn-primary">Get App</a>
          </div>
        </div>
      </header>

      <main class="page-main-content">
        <section class="faq-section">
          <div class="section-container">
            <div class="center-editorial-header">
              <span class="section-eyebrow"><i class="bi bi-question-circle me-1"></i> FREQUENTLY ASKED QUESTIONS</span>
              <h2>அடிக்கடி கேட்கப்படும் கேள்விகள்</h2>
              <p class="section-desc">EVERYTHING YOU NEED TO KNOW ABOUT ASTRO DIVINE</p>
            </div>

            <div class="faq-accordion-rows">
              @for (faq of faqs; track faq.question; let idx = $index) {
                <div class="faq-accordion-row" [class.active]="faq.open">
                  <div class="faq-row-header" (click)="toggleFaq(idx)">
                    <h3>{{ faq.question }}</h3>
                    <span class="faq-row-toggle"><i [class]="faq.open ? 'bi bi-dash-lg' : 'bi bi-plus-lg'"></i></span>
                  </div>
                  @if (faq.open) {
                    <div class="faq-row-body">
                      <p>{{ faq.answer }}</p>
                    </div>
                  }
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
export class FaqPageComponent {
  faqs = [
    { question: 'என் ஜாதகக் கணிப்பு அறிக்கை எவ்வளவு நேரத்தில் கிடைக்கும்?', answer: 'உங்கள் விவரங்களைச் சமர்ப்பித்த 24 முதல் 48 மணி நேரத்திற்குள் உங்களது விரிவான ஜாதகக் கணிப்பு PDF வடிவில் செயலியில் பதிவேற்றப்படும்.', open: true },
    { question: 'பிறந்த நேரம் துல்லியமாக தெரியவில்லை என்றால் ஜாதகம் கணிக்க முடியுமா?', answer: 'ஆம், எங்கள் முதன்மை ஜோதிடர்கள் பிரசன்ன ஜோதிட முறை மற்றும் எண்கணித முறை மூலம் உங்கள் கேள்விகளுக்குத் துல்லியமான வழிகாட்டுதல் வழங்குவர்.', open: false },
    { question: 'கட்டணம் செலுத்தும் முறை பாதுகாப்பானதா?', answer: 'நிச்சயமாக! Google Pay, PhonePe, Paytm, Credit/Debit cards மற்றும் Net Banking மூலம் 100% பாதுகாப்பான பரிவர்த்தனை வசதி உள்ளது.', open: false },
    { question: 'நேரடி ஜோதிட ஆலோசனையை எவ்வாறு முன்பதிவு செய்வது?', answer: 'செயலியில் உள்ள "ஜோதிடர்கள்" பகுதிக்குச் சென்று உங்களுக்கு விருப்பமான ஜோதிடரைத் தேர்ந்தெடுத்து, நேரத்தைச் தேர்வு செய்து முன்பதிவு செய்து கொள்ளலாம்.', open: false }
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
