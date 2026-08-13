import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-zodiac-page',
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
            <a routerLink="/zodiac" routerLinkActive="active">ராசி பலன்</a>
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
        <section class="zodiac-section">
          <div class="section-container">
            <div class="center-editorial-header">
              <span class="section-eyebrow"><i class="bi bi-stars me-1"></i> DAILY HOROSCOPE</span>
              <h2>12 ராசிகளுக்கான தினசரி பலன்கள்</h2>
              <p class="section-desc">SELECT YOUR ZODIAC SIGN &bull; DAILY COSMIC PREDICTIONS</p>
            </div>

            <div class="celestial-zodiac-selector">
              <div class="zodiac-btns-layout">
                <button 
                  *ngFor="let zodiac of zodiacSigns" 
                  class="zodiac-luxury-btn"
                  [class.active]="selectedZodiac.name === zodiac.name"
                  (click)="selectZodiac(zodiac)">
                  <span class="sign-glyph">{{ zodiac.symbol }}</span>
                  <span class="sign-tamil-name">{{ zodiac.name }}</span>
                </button>
              </div>

              <div class="zodiac-display-card">
                <div class="card-inner-halo"></div>
                <div class="zodiac-display-header">
                  <span class="display-symbol-large">{{ selectedZodiac.symbol }}</span>
                  <h3>{{ selectedZodiac.name }}</h3>
                  <span class="display-label-sub">{{ selectedZodiac.englishName }} &bull; {{ selectedZodiac.dates }}</span>
                </div>
                <p class="zodiac-display-prediction">
                  "{{ selectedZodiac.prediction }}"
                </p>
                <a routerLink="/" class="btn-card-luxury">முழுமையான ஜாதக பலன்கள் <i class="bi bi-chevron-right ms-2"></i></a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <div class="section-container">
          <div class="footer-bottom-bar">
            <p>&copy; 2026 Astro Divine. All Rights Reserved. Dedicated Zodiac Predictions Page.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrl: '../landing/landing.component.css'
})
export class ZodiacPageComponent {
  zodiacSigns = [
    { name: 'மேஷம்', symbol: '♈', englishName: 'Aries', dates: 'Mar 21 - Apr 19', prediction: 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.' },
    { name: 'ரிஷபம்', symbol: '♉', englishName: 'Taurus', dates: 'Apr 20 - May 20', prediction: 'இன்று தனலாபம் உண்டு. குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.' },
    { name: 'மிதுனம்', symbol: '♊', englishName: 'Gemini', dates: 'May 21 - Jun 20', prediction: 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். நண்பர்களின் ஆதரவு கிடைக்கும்.' },
    { name: 'கடகம்', symbol: '♋', englishName: 'Cancer', dates: 'Jun 21 - Jul 22', prediction: 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். புதிய முயற்சிகள் கைகூடும்.' },
    { name: 'சிம்மம்', symbol: '♌', englishName: 'Leo', dates: 'Jul 23 - Aug 22', prediction: 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். சுப நிகழ்ச்சிகள் திட்டமிடுவீர்கள்.' },
    { name: 'கன்னி', symbol: '♍', englishName: 'Virgo', dates: 'Aug 23 - Sep 22', prediction: 'அலுவலகத்தில் உங்களின் உழைப்பிற்கு நல்ல அங்கீகாரம் கிடைக்கும்.' },
    { name: 'துலாம்', symbol: '♎', englishName: 'Libra', dates: 'Sep 23 - Oct 22', prediction: 'பயணங்களால் நன்மைகள் விளையும். பணப்புழக்கம் தாராளமாக இருக்கும்.' },
    { name: 'விருச்சிகம்', symbol: '♏', englishName: 'Scorpio', dates: 'Oct 23 - Nov 21', prediction: 'ஆரோக்கியத்தில் கவனம் தேவை. காரியங்களில் சிந்தித்து செயல்படவும்.' },
    { name: 'தனுசு', symbol: '♐', englishName: 'Sagittarius', dates: 'Nov 22 - Dec 21', prediction: 'தொழில் விரிவாக்க சிந்தனை மேலோங்கும். நல்ல லாபம் கிட்டும்.' },
    { name: 'மகரம்', symbol: '♑', englishName: 'Capricorn', dates: 'Dec 22 - Jan 19', prediction: 'உறவினர்களின் ஆதரவு கிடைக்கும். தடைபட்ட காரியங்கள் நிவர்த்தியாகும்.' },
    { name: 'கும்பம்', symbol: '♒', englishName: 'Aquarius', dates: 'Jan 20 - Feb 18', prediction: 'சுப செய்தி வந்து சேரும். எதிர்பார்த்த தனவரவு உண்டாகும்.' },
    { name: 'மீனம்', symbol: '♓', englishName: 'Pisces', dates: 'Feb 19 - Mar 20', prediction: 'ஆன்மீக சிந்தனை மேலோங்கும். புதிய மனிதர்களின் நட்பு கிடைக்கும்.' }
  ];

  selectedZodiac = this.zodiacSigns[1];

  selectZodiac(zodiac: any) {
    this.selectedZodiac = zodiac;
  }
}
