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
              <span class="english-subtitle">ARUTHRA ASTROLOGY</span>
            </div>
          </div>
          <nav class="nav-links">
            <a routerLink="/">முகப்பு</a>
            <a routerLink="/panchangam">பஞ்சாங்கம்</a>
            <a routerLink="/zodiac">ராசி பலன்</a>
            <a routerLink="/services">சேவைகள்</a>
            <a routerLink="/astrologers">ஜோதிடர்கள்</a>
            <a routerLink="/testimonials">மதிப்புரைகள்</a>
            <a routerLink="/faq" routerLinkActive="active">FAQ</a>
          </nav>
          <div class="header-actions">
            <a routerLink="/" class="btn-primary">Get App</a>
          </div>
        </div>
      </header>

      <main class="page-main-content">
        <section class="faq-section">
          <div class="section-container">
            <div class="center-editorial-header">
              <span class="section-eyebrow"><i class="bi bi-question-circle me-1"></i> FREQUENTLY ASKED QUESTIONS</span>
              <h2>அடிக்கடி கேட்கப்படும் கேள்விகள்</h2>
              <p class="section-desc">EVERYTHING YOU NEED TO KNOW ABOUT ARUTHRA ASTROLOGY</p>
            </div>

            <div class="faq-accordion-rows">
              <div class="faq-accordion-row" *ngFor="let faq of faqs; let idx = index" [class.active]="faq.open">
                <div class="faq-row-header" (click)="toggleFaq(idx)">
                  <h3>{{ faq.question }}</h3>
                  <span class="faq-row-toggle"><i [class]="faq.open ? 'bi bi-dash-lg' : 'bi bi-plus-lg'"></i></span>
                </div>
                <div class="faq-row-body" *ngIf="faq.open">
                  <p>{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <div class="section-container">
          <div class="footer-bottom-bar">
            <p>&copy; 2026 Aruthra Astrology. All Rights Reserved. Dedicated FAQ Page.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrl: '../landing/landing.component.css'
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
