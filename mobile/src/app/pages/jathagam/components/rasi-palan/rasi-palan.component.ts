import { environment } from '../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonSpinner } from '@ionic/angular/standalone';

const RASI_SYMBOLS: Record<string, string> = {
  'மேஷம்': '♈', 'ரிஷபம்': '♉', 'மிதுனம்': '♊', 'கடகம்': '♋',
  'சிம்மம்': '♌', 'கன்னி': '♍', 'துலாம்': '♎', 'விருச்சிகம்': '♏',
  'தனுசு': '♐', 'மகரம்': '♑', 'கும்பம்': '♒', 'மீனம்': '♓'
};

@Component({
  selector: 'app-rasi-palan',
  standalone: true,
  imports: [CommonModule, FormsModule, IonSpinner],
  template: `
    <div class="rasi-wrapper">

      <!-- Tab Selector -->
      <div class="tab-selector">
        @for (t of tabs; track t.value) {
          <button [class.active]="activeType === t.value" (click)="changeType(t.value)">
            {{ t.label }}
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="center-loader">
          <ion-spinner name="crescent" color="warning"></ion-spinner>
          <p>ராசி பலன் ஏற்றுகிறது...</p>
        </div>
      } @else {
        <!-- 12 Rasi Cards Grid -->
        <div class="rasi-grid">
          @for (p of predictions; track p.rasi_name) {
            <div class="rasi-card" (click)="expand(p)">
              <div class="rasi-top">
                <span class="rasi-symbol">{{ getSymbol(p.rasi_name) }}</span>
                <div>
                  <h3>{{ p.rasi_name }}</h3>
                  <span class="rasi-type-badge">{{ activeType }}</span>
                </div>
              </div>
              <p class="rasi-preview">{{ p.prediction_text | slice:0:80 }}...</p>
              @if (p.audio_url) {
                <div class="audio-row">
                  <button class="play-btn" (click)="playAudio(p.audio_url, $event)">▶ Audio Prediction</button>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Expanded Detail Modal -->
      @if (expanded) {
        <div class="detail-overlay" (click)="expanded = null">
          <div class="detail-modal" (click)="$event.stopPropagation()">
            <div class="detail-header">
              <span class="big-symbol">{{ getSymbol(expanded.rasi_name) }}</span>
              <div>
                <h2>{{ expanded.rasi_name }}</h2>
                <span class="type-pill">{{ activeType | titlecase }} பலன்</span>
              </div>
              <button class="close-x" (click)="expanded = null">✕</button>
            </div>
            <p class="full-text">{{ expanded.prediction_text }}</p>
            @if (expanded.audio_url) {
              <div class="audio-section">
                <audio [src]="expanded.audio_url" controls style="width:100%"></audio>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .rasi-wrapper { padding: 0 12px 80px; }

    .tab-selector {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 12px 0;
      scrollbar-width: none;
    }

    .tab-selector button {
      padding: 6px 16px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 20px;
      color: #ccc;
      font-size: 12px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .tab-selector button.active {
      background: linear-gradient(135deg, #d4af37, #aa7c11);
      color: #000;
      border-color: transparent;
      font-weight: 700;
    }

    .center-loader { text-align: center; padding: 60px 20px; color: #8a8ab0; }

    .rasi-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .rasi-card {
      background: linear-gradient(135deg, #1a0f35, #160b2c);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 16px;
      padding: 14px;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;
    }

    .rasi-card:active { transform: scale(0.97); border-color: #ffd700; }

    .rasi-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .rasi-symbol { font-size: 28px; }
    .rasi-top h3 { margin: 0; font-size: 14px; color: #ffd700; font-weight: 700; }
    .rasi-type-badge { font-size: 9px; color: #a855f7; background: rgba(168,85,247,0.15); padding: 2px 6px; border-radius: 4px; }
    .rasi-preview { font-size: 11px; color: #a0a0c0; line-height: 1.5; margin: 0; }
    .play-btn { margin-top: 8px; padding: 4px 10px; background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.3); color: #ffd700; border-radius: 8px; font-size: 11px; cursor: pointer; }

    .detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: flex-end; }
    .detail-modal { background: #170f30; border-radius: 24px 24px 0 0; padding: 24px; width: 100%; max-height: 85vh; overflow-y: auto; border-top: 2px solid rgba(212,175,55,0.4); }
    .detail-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
    .big-symbol { font-size: 48px; }
    .detail-header h2 { margin: 0; font-size: 22px; color: #ffd700; }
    .type-pill { background: rgba(168,85,247,0.2); color: #d8b4fe; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
    .close-x { margin-left: auto; background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; }
    .full-text { color: #d0d0f0; line-height: 1.8; font-size: 14px; }
    .audio-section { margin-top: 14px; }
  `]
})
export class RasiPalanComponent implements OnInit {
  tabs = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];
  activeType = 'daily';
  predictions: any[] = [];
  expanded: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.load(); }

  changeType(type: string) {
    this.activeType = type;
    this.load();
  }

  load() {
    this.loading = true;
    const today = new Date().toISOString().split('T')[0];
    this.http.get<any>(`${environment.apiUrl}/rasi-palan?date=${today}&type=${this.activeType}`).subscribe({
      next: res => { this.predictions = res.predictions; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getSymbol(rasi: string): string { return RASI_SYMBOLS[rasi] ?? '⭐'; }

  expand(p: any) { this.expanded = p; }

  playAudio(url: string, e: Event) {
    e.stopPropagation();
    new Audio(url).play().catch(() => {});
  }
}
