import { environment } from '../../../environments/environment';
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
  astrologers: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/public/astrologers`).subscribe({
      next: (res) => {
        this.astrologers = res.astrologers || [];
        this.isLoading = false;
      },
      error: () => {
        this.astrologers = [];
        this.isLoading = false;
      }
    });
  }
}
