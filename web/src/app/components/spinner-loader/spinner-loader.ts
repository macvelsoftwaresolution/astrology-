import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-spinner-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="luxury-spinner-overlay">
        <div class="luxury-spinner-box">
          <div class="celestial-orbit-ring">
            <div class="inner-glowing-moon">
              <i class="bi bi-moon-stars-fill"></i>
            </div>
          </div>
          <div class="loader-brand-text">
            <span class="tamil-loader-title">ஆருத்ரா ஜோதிடம்</span>
            <span class="english-loader-sub">ASTRO DIVINE</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .luxury-spinner-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(15, 3, 26, 0.78);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.25s ease-out forwards;
    }

    .luxury-spinner-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      padding: 2.5rem 3rem;
      background: rgba(33, 8, 54, 0.85);
      border: 1px solid rgba(230, 198, 135, 0.4);
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 168, 79, 0.25);
    }

    .celestial-orbit-ring {
      position: relative;
      width: 76px;
      height: 76px;
      border: 3.5px solid rgba(212, 168, 79, 0.15);
      border-top-color: #E6C687;
      border-right-color: #C5A059;
      border-radius: 50%;
      animation: celestialSpin 1.1s linear infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .inner-glowing-moon {
      font-size: 1.8rem;
      color: #E6C687;
      filter: drop-shadow(0 0 10px rgba(230, 198, 135, 0.8));
      animation: moonPulse 1.5s ease-in-out infinite alternate;
    }

    .loader-brand-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .tamil-loader-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FAF5EC;
      letter-spacing: 0.5px;
    }

    .english-loader-sub {
      font-size: 0.65rem;
      font-weight: 600;
      color: #E6C687;
      letter-spacing: 2.5px !important;
    }

    @keyframes celestialSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes moonPulse {
      0% { transform: scale(0.9); opacity: 0.8; }
      100% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 16px rgba(230, 198, 135, 1)); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class SpinnerLoaderComponent {
  protected loadingService = inject(LoadingService);
}
