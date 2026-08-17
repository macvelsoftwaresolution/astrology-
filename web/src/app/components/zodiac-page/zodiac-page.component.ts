import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-zodiac-page',
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
            <a routerLink="/zodiac" routerLinkActive="active">ராசி பலன்</a>
            <a routerLink="/services">சேவைகள்</a>
            <a routerLink="/astrologers">ஜோதிடர்கள்</a>
            <a routerLink="/faq">FAQ</a>
          </nav>
          <div class="header-actions">
            <a routerLink="/admin" class="btn-secondary me-2" style="padding: 8px 14px; font-size: 13px; text-decoration: none; border-radius: 8px; border: 1px solid rgba(212,175,55,0.4); color: #ffd700;">Admin Panel</a>
            <a routerLink="/" class="btn-primary">Get App</a>
          </div>
        </div>
      </header>

      <main class="page-main-content">
        <section class="zodiac-section">
          <div class="section-container">
            <div class="center-editorial-header">
              <span class="section-eyebrow"><i class="bi bi-stars me-1"></i> LIVE COSMIC HOROSCOPE</span>
              <h2>12 ராசிகளுக்கான {{ getTabTamilTitle() }}</h2>
              <p class="section-desc">SELECT YOUR ZODIAC SIGN &bull; DYNAMIC REAL-TIME PREDICTIONS</p>
              
              <!-- Tab Selector -->
              <div class="zodiac-period-tabs">
                <button 
                  *ngFor="let t of tabs" 
                  [class.active]="selectedTab === t.val"
                  (click)="changeTab(t.val)">
                  {{ t.tamil }} ({{ t.english }})
                </button>
              </div>
            </div>

            <!-- Loading Indicator -->
            <div *ngIf="loading" class="zodiac-loader-wrap">
              <div class="spinner-border text-warning" role="status"></div>
              <span>வானியல் கணிப்புகள் ஏற்றப்படுகிறது...</span>
            </div>

            <div *ngIf="!loading" class="celestial-zodiac-selector">
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
                  <span class="live-badge-pill"><span class="pulse-dot"></span> நேரலை கணிப்பு (Live Sync)</span>
                </div>

                <p class="zodiac-display-prediction">
                  "{{ selectedZodiac.prediction }}"
                </p>

                <!-- Optional Audio Player -->
                <div *ngIf="selectedZodiac.audioUrl" class="zodiac-audio-player">
                  <div class="audio-info">
                    <i class="bi bi-volume-up-fill text-gold me-2"></i>
                    <span>ராசி பலன் ஆடியோ உரை (Audio Forecast)</span>
                  </div>
                  <audio [src]="selectedZodiac.audioUrl" controls style="width: 100%; border-radius: 8px; margin-top: 8px;"></audio>
                </div>

                <!-- Optional Video Player (NEW) -->
                <div *ngIf="selectedZodiac.videoUrl" class="zodiac-video-player-box">
                  <div class="video-header-info">
                    <i class="bi bi-play-btn-fill text-gold me-2"></i>
                    <span>{{ selectedZodiac.name }} ராசி பலன் வீடியோ உரை (Video Horoscope)</span>
                  </div>
                  <div *ngIf="isYouTube(selectedZodiac.videoUrl)" class="video-embed-responsive">
                    <iframe 
                      [src]="getVideoSafeUrl(selectedZodiac.videoUrl)" 
                      title="Zodiac Video Forecast" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen>
                    </iframe>
                  </div>
                  <div *ngIf="!isYouTube(selectedZodiac.videoUrl)" class="video-direct-responsive">
                    <video [src]="selectedZodiac.videoUrl" controls style="width: 100%; border-radius: 12px; max-height: 340px; background: #000;"></video>
                  </div>
                </div>

                <div class="zodiac-card-actions">
                  <a routerLink="/" class="btn-card-luxury">முழுமையான ஜாதக பலன்கள் <i class="bi bi-chevron-right ms-2"></i></a>
                  <button class="btn-refresh-zodiac" (click)="loadPredictions()" title="Refresh Predictions">
                    <i class="bi bi-arrow-clockwise"></i> புதுப்பி
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <div class="section-container">
          <div class="footer-bottom-bar">
            <p>&copy; 2026 Astro Divine. All Rights Reserved. Dynamic Zodiac Predictions Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['../landing/landing.component.css'],
  styles: [`
    .zodiac-video-player-box {
      margin: 20px 0;
      background: rgba(212, 175, 55, 0.06);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 14px;
      padding: 16px;
      text-align: left;
    }
    .video-header-info {
      font-size: 13px;
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    .video-embed-responsive {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: 12px;
      background: #000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .video-embed-responsive iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
  `]
})
export class ZodiacPageComponent implements OnInit {
  tabs = [
    { val: 'daily', english: 'Daily', tamil: 'தினசரி பலன்' },
    { val: 'weekly', english: 'Weekly', tamil: 'வார பலன்' },
    { val: 'monthly', english: 'Monthly', tamil: 'மாத பலன்' },
    { val: 'yearly', english: 'Yearly', tamil: 'வருட பலன்' }
  ];

  selectedTab = 'daily';
  loading = false;

  zodiacSigns = [
    { name: 'மேஷம்', symbol: '♈', englishName: 'Aries', dates: 'Mar 21 - Apr 19', prediction: 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.', audioUrl: '', videoUrl: '' },
    { name: 'ரிஷபம்', symbol: '♉', englishName: 'Taurus', dates: 'Apr 20 - May 20', prediction: 'இன்று தனலாபம் உண்டு. குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.', audioUrl: '', videoUrl: '' },
    { name: 'மிதுனம்', symbol: '♊', englishName: 'Gemini', dates: 'May 21 - Jun 20', prediction: 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். நண்பர்களின் ஆதரவு கிடைக்கும்.', audioUrl: '', videoUrl: '' },
    { name: 'கடகம்', symbol: '♋', englishName: 'Cancer', dates: 'Jun 21 - Jul 22', prediction: 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். புதிய முயற்சிகள் கைகூடும்.', audioUrl: '', videoUrl: '' },
    { name: 'சிம்மம்', symbol: '♌', englishName: 'Leo', dates: 'Jul 23 - Aug 22', prediction: 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். சுப நிகழ்ச்சிகள் திட்டமிடுவீர்கள்.', audioUrl: '', videoUrl: '' },
    { name: 'கன்னி', symbol: '♍', englishName: 'Virgo', dates: 'Aug 23 - Sep 22', prediction: 'அலுவலகத்தில் உங்களின் உழைப்பிற்கு நல்ல அங்கீகாரம் கிடைக்கும்.', audioUrl: '', videoUrl: '' },
    { name: 'துலாம்', symbol: '♎', englishName: 'Libra', dates: 'Sep 23 - Oct 22', prediction: 'பயணங்களால் நன்மைகள் விளையும். பணப்புழக்கம் தாராளமாக இருக்கும்.', audioUrl: '', videoUrl: '' },
    { name: 'விருச்சிகம்', symbol: '♏', englishName: 'Scorpio', dates: 'Oct 23 - Nov 21', prediction: 'ஆரோக்கியத்தில் கவனம் தேவை. காரியங்களில் சிந்தித்து செயல்படவும்.', audioUrl: '', videoUrl: '' },
    { name: 'தனுசு', symbol: '♐', englishName: 'Sagittarius', dates: 'Nov 22 - Dec 21', prediction: 'தொழில் விரிவாக்க சிந்தனை மேலோங்கும். நல்ல லாபம் கிட்டும்.', audioUrl: '', videoUrl: '' },
    { name: 'மகரம்', symbol: '♑', englishName: 'Capricorn', dates: 'Dec 22 - Jan 19', prediction: 'உறவினர்களின் ஆதரவு கிடைக்கும். தடைபட்ட காரியங்கள் நிவர்த்தியாகும்.', audioUrl: '', videoUrl: '' },
    { name: 'கும்பம்', symbol: '♒', englishName: 'Aquarius', dates: 'Jan 20 - Feb 18', prediction: 'சுப செய்தி வந்து சேரும். எதிர்பார்த்த தனவரவு உண்டாகும்.', audioUrl: '', videoUrl: '' },
    { name: 'மீனம்', symbol: '♓', englishName: 'Pisces', dates: 'Feb 19 - Mar 20', prediction: 'ஆன்மீக சிந்தனை மேலோங்கும். புதிய மனிதர்களின் நட்பு கிடைக்கும்.', audioUrl: '', videoUrl: '' }
  ];

  selectedZodiac = this.zodiacSigns[1];

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPredictions();
  }

  changeTab(tabVal: string): void {
    this.selectedTab = tabVal;
    this.loadPredictions();
  }

  getTabTamilTitle(): string {
    const found = this.tabs.find(t => t.val === this.selectedTab);
    return found ? found.tamil : 'தினசரி பலன்கள்';
  }

  isYouTube(url: string): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getVideoSafeUrl(url: string): SafeResourceUrl | null {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  loadPredictions(): void {
    if (typeof window === 'undefined') return;
    this.loading = true;
    const today = new Date().toISOString().split('T')[0];

    this.http.get<any>(`http://127.0.0.1:8000/api/rasi-palan?date=${today}&type=${this.selectedTab}`).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && Array.isArray(res.predictions) && res.predictions.length > 0) {
          this.zodiacSigns = this.zodiacSigns.map(z => {
            const found = res.predictions.find((p: any) => p.rasi_name === z.name);
            return {
              ...z,
              prediction: found && found.prediction_text ? found.prediction_text : z.prediction,
              audioUrl: found && found.audio_url ? found.audio_url : '',
              videoUrl: found && found.video_url ? found.video_url : ''
            };
          });

          // Keep selected zodiac updated
          const currentSelected = this.zodiacSigns.find(z => z.name === this.selectedZodiac.name);
          if (currentSelected) {
            this.selectedZodiac = currentSelected;
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectZodiac(zodiac: any): void {
    this.selectedZodiac = zodiac;
  }
}
