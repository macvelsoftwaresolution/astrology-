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
                @for (t of tabs; track t.val) {
                  <button 
                    [class.active]="selectedTab === t.val"
                    (click)="changeTab(t.val)">
                    {{ t.tamil }} ({{ t.english }})
                  </button>
                }
              </div>
            </div>

            <!-- Loading Indicator -->
            @if (loading) {
              <div class="zodiac-loader-wrap">
                <div class="spinner-border text-warning" role="status"></div>
                <span>வானியல் கணிப்புகள் ஏற்றப்படுகிறது...</span>
              </div>
            } @else {
              <div class="celestial-zodiac-selector">
                <div class="zodiac-btns-layout">
                  @for (zodiac of zodiacSigns; track zodiac.name) {
                    <button 
                      class="zodiac-luxury-btn"
                      [class.active]="selectedZodiac.name === zodiac.name"
                      (click)="selectZodiac(zodiac)">
                      <span class="sign-glyph">{{ zodiac.symbol }}</span>
                      <span class="sign-tamil-name">{{ zodiac.name }}</span>
                    </button>
                  }
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
                  @if (selectedZodiac.audioUrl) {
                    <div class="zodiac-audio-player">
                      <div class="audio-info">
                        <i class="bi bi-volume-up-fill text-gold me-2"></i>
                        <span>ராசி பலன் ஆடியோ உரை (Audio Forecast)</span>
                      </div>
                      <audio [src]="selectedZodiac.audioUrl" controls style="width: 100%; border-radius: 8px; margin-top: 8px;"></audio>
                    </div>
                  }

                  <!-- Optional Video Player (NEW) -->
                  @if (selectedZodiac.videoUrl) {
                    <div class="zodiac-video-player-box">
                      <div class="video-header-info">
                        <i class="bi bi-play-btn-fill text-gold me-2"></i>
                        <span>{{ selectedZodiac.name }} ராசி பலன் வீடியோ உரை (Video Horoscope)</span>
                      </div>
                      @if (isYouTube(selectedZodiac.videoUrl)) {
                        <div class="video-embed-responsive">
                          <iframe 
                            [src]="getVideoSafeUrl(selectedZodiac.videoUrl)" 
                            title="Zodiac Video Forecast" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                          </iframe>
                        </div>
                      } @else {
                        <div class="video-direct-responsive">
                          <video [src]="selectedZodiac.videoUrl" controls style="width: 100%; border-radius: 12px; max-height: 340px; background: #000;"></video>
                        </div>
                      }
                    </div>
                  }

                  <div class="zodiac-card-actions">
                    <a routerLink="/" class="btn-card-luxury">முழுமையான ஜாதக பலன்கள் <i class="bi bi-chevron-right ms-2"></i></a>
                    <button class="btn-refresh-zodiac" (click)="loadPredictions()" title="Refresh Predictions">
                      <i class="bi bi-arrow-clockwise"></i> புதுப்பி
                    </button>
                  </div>
                </div>
              </div>
            }
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
    { name: 'மேஷம்', symbol: '♈', englishName: 'Aries', dates: 'Mar 21 - Apr 19', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'ரிஷபம்', symbol: '♉', englishName: 'Taurus', dates: 'Apr 20 - May 20', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'மிதுனம்', symbol: '♊', englishName: 'Gemini', dates: 'May 21 - Jun 20', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'கடகம்', symbol: '♋', englishName: 'Cancer', dates: 'Jun 21 - Jul 22', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'சிம்மம்', symbol: '♌', englishName: 'Leo', dates: 'Jul 23 - Aug 22', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'கன்னி', symbol: '♍', englishName: 'Virgo', dates: 'Aug 23 - Sep 22', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'துலாம்', symbol: '♎', englishName: 'Libra', dates: 'Sep 23 - Oct 22', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'விருச்சிகம்', symbol: '♏', englishName: 'Scorpio', dates: 'Oct 23 - Nov 21', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'தனுசு', symbol: '♐', englishName: 'Sagittarius', dates: 'Nov 22 - Dec 21', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'மகரம்', symbol: '♑', englishName: 'Capricorn', dates: 'Dec 22 - Jan 19', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'கும்பம்', symbol: '♒', englishName: 'Aquarius', dates: 'Jan 20 - Feb 18', prediction: '', audioUrl: '', videoUrl: '' },
    { name: 'மீனம்', symbol: '♓', englishName: 'Pisces', dates: 'Feb 19 - Mar 20', prediction: '', audioUrl: '', videoUrl: '' }
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
