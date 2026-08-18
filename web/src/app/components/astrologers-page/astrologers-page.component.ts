import { Component, OnInit } from '@angular/core';
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
            <a routerLink="/services" class="btn-primary">முன்பதிவு செய்க</a>
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
                      <i [class]="astro.avatar_icon || 'bi bi-person-fill'"></i>
                      <span class="astro-exp-label">{{ astro.experience }}</span>
                    </div>
                  </div>
                  <div class="astro-card-right">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                      <div>
                        <h3 style="margin:0 0 2px 0;">{{ astro.name }}</h3>
                        <span class="astro-editorial-role">{{ astro.role_title || astro.role }}</span>
                      </div>
                      <span style="background:#fef3c7;border:1px solid #fde68a;color:#b45309;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:800;">
                        ₹{{ astro.fee }}
                      </span>
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
                      <a routerLink="/services" class="btn-astro-consult">
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
          <div class="footer-bottom-bar">
            <p>&copy; 2026 Astro Divine. All Rights Reserved. Dedicated Astrologers Page.</p>
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
      role_title: 'தலைமை வேத ஜோதிடர்',
      experience: '25+ ஆண்டுகள் அனுபவம்',
      specialty: 'துல்லிய ஜாதகக் கணிப்பு, திருமணப் பொருத்தம், பிரசன்ன ஜோதிடம்',
      fee: 999,
      status: 'Available',
      bio: 'வேத ஜோதிடக் கலை பாரம்பரிய குடும்பத்தைச் சேர்ந்தவர். ஆயிரக்கணக்கான குடும்பங்களுக்கு துல்லியமான வழிகாட்டுதல் வழங்கியுள்ளார்.',
      avatar_icon: 'bi bi-person-fill'
    },
    {
      name: 'குரு ராமஜெயம்',
      role_title: 'முதுநிலை பிரசன்ன & வாஸ்து நிபுணர்',
      experience: '18+ ஆண்டுகள் அனுபவம்',
      specialty: 'கேள்வி ஜோதிடம், வாஸ்து சாஸ்திரம், தோஷ நிவாரணப் பரிகாரங்கள்',
      fee: 799,
      status: 'Available',
      bio: 'பிரசன்ன ஜோதிடம் மற்றும் வாஸ்து சாஸ்திரத்தில் ஆழமான ஞானம் கொண்டவர். எளிய பரிகாரங்கள் மூலம் தீர்வு வழங்குபவர்.',
      avatar_icon: 'bi bi-person-bounding-box'
    },
    {
      name: 'குரு மீனாட்சி சுந்தரம்',
      role_title: 'நாடி & நியூமராலஜி வல்லுநர்',
      experience: '15+ ஆண்டுகள் அனுபவம்',
      specialty: 'நாடி ஜோதிடம், நியூமராலஜி பெயர் அதிர்ஷ்டம், தொழில் & வியாபார யோகம்',
      fee: 599,
      status: 'Available',
      bio: 'நாடி சுவடி வாசிப்பு மற்றும் எண்கணிதத்தில் (Numerology) தேர்ச்சி பெற்றவர். தொழில் மற்றும் வியாபார வெற்றிக்கு ஆலோசனை தருபவர்.',
      avatar_icon: 'bi bi-person-badge'
    }
  ];

  astrologers: any[] = [...this.defaultAstrologers];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://127.0.0.1:8000/api/public/astrologers').subscribe({
      next: (res) => {
        if (res.astrologers && res.astrologers.length > 0) {
          this.astrologers = res.astrologers;
        }
      },
      error: () => {}
    });
  }
}
