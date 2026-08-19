import { environment } from '../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonSpinner } from '@ionic/angular/standalone';

const RASIS = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];
const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Moola','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati'
];

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [FormsModule, IonSpinner],
  template: `
    <div class="matching-wrapper">

      <!-- STEP 1: FORM -->
      @if (step === 'form') {
        <div>
          <div class="section-title">
            <h2>💑 திருமண பொருத்தம்</h2>
            <p>பையன் மற்றும் பெண் ஜாதக விவரங்களை உள்ளிடவும்</p>
          </div>

          <div class="two-panel">
            <!-- Boy Panel -->
            <div class="panel boy-panel">
              <div class="panel-header boy">👦 பையன் விவரம்</div>
              <label>பெயர்</label>
              <input [(ngModel)]="form.boy_name" placeholder="பையன் பெயர்" class="field"/>
              <label>பிறந்த தேதி</label>
              <input type="date" [(ngModel)]="form.boy_dob" class="field"/>
              <label>பிறந்த நேரம்</label>
              <input type="time" [(ngModel)]="form.boy_tob" class="field"/>
              <label>பிறந்த ஊர்</label>
              <input [(ngModel)]="form.boy_pob" placeholder="ஊர் பெயர்" class="field"/>
              <label>ராசி</label>
              <select [(ngModel)]="form.boy_rasi" class="field">
                <option value="">-- ராசி தேர்வு --</option>
                @for (r of rasiList; track r) {
                  <option [value]="r">{{ r }}</option>
                }
              </select>
              <label>நட்சத்திரம்</label>
              <select [(ngModel)]="form.boy_nakshatra" class="field">
                <option value="">-- நட்சத்திரம் --</option>
                @for (n of nakshatras; track n) {
                  <option [value]="n">{{ n }}</option>
                }
              </select>
            </div>

            <!-- Girl Panel -->
            <div class="panel girl-panel">
              <div class="panel-header girl">👧 பெண் விவரம்</div>
              <label>பெயர்</label>
              <input [(ngModel)]="form.girl_name" placeholder="பெண் பெயர்" class="field"/>
              <label>பிறந்த தேதி</label>
              <input type="date" [(ngModel)]="form.girl_dob" class="field"/>
              <label>பிறந்த நேரம்</label>
              <input type="time" [(ngModel)]="form.girl_tob" class="field"/>
              <label>பிறந்த ஊர்</label>
              <input [(ngModel)]="form.girl_pob" placeholder="ஊர் பெயர்" class="field"/>
              <label>ராசி</label>
              <select [(ngModel)]="form.girl_rasi" class="field">
                <option value="">-- ராசி தேர்வு --</option>
                @for (r of rasiList; track r) {
                  <option [value]="r">{{ r }}</option>
                }
              </select>
              <label>நட்சத்திரம்</label>
              <select [(ngModel)]="form.girl_nakshatra" class="field">
                <option value="">-- நட்சத்திரம் --</option>
                @for (n of nakshatras; track n) {
                  <option [value]="n">{{ n }}</option>
                }
              </select>
            </div>
          </div>

          <button class="submit-btn" (click)="calculate()" [disabled]="loading">
            @if (loading) {
              <ion-spinner name="crescent" style="width:18px;height:18px"></ion-spinner>
            } @else {
              <span>🔮 பொருத்தம் கண்டுபிடி</span>
            }
          </button>

          @if (errorMsg) {
            <p class="error-msg">{{ errorMsg }}</p>
          }
        </div>
      }

      <!-- STEP 2: RESULT -->
      @if (step === 'result' && result) {
        <div>
          <div class="result-header" [class.match]="result.match_status === 'Match'" [class.nomatch]="result.match_status !== 'Match'">
            <div class="big-score">
              <span class="score-num">{{ result.match_score }}</span>
              <span class="score-max">/10</span>
            </div>
            <div class="result-info">
              <h2>{{ result.match_status === 'Match' ? '✅ நல்ல பொருத்தம்!' : '❌ பொருத்தம் இல்லை' }}</h2>
              <p>{{ result.boy_name }} ↔ {{ result.girl_name }}</p>
              <p class="result-msg">{{ result.message }}</p>
            </div>
          </div>

          <!-- 10 Porutham Breakdown -->
          <div class="breakdown-list">
            <h3>10 பொருத்த விவரம்</h3>
            @for (d of result.match_details; track d.name) {
              <div class="porutham-row">
                <span class="porutham-name">{{ d.name }}</span>
                <span class="porutham-result" [class.match]="d.result === 'Match'" [class.nomatch]="d.result !== 'Match'">
                  {{ d.result === 'Match' ? '✅' : '❌' }} {{ d.result }}
                </span>
              </div>
            }
          </div>

          <!-- Book Detailed Consultation -->
          <div class="consultation-cta">
            <p>மேலும் விவரமான ஜாதக ஆலோசனை வேண்டுமா?</p>
            <button class="cta-btn">📅 Appointment Book செய்யுங்கள்</button>
          </div>

          <button class="reset-btn" (click)="reset()">← மீண்டும் தேட</button>
        </div>
      }

    </div>
  `,
  styles: [`
    .matching-wrapper { padding: 12px 14px 80px; }
    .section-title { margin-bottom: 16px; }
    .section-title h2 { color: #ffd700; margin: 0 0 4px; font-size: 18px; }
    .section-title p { color: #8a8ab0; font-size: 12px; margin: 0; }

    .two-panel { display: flex; flex-direction: column; gap: 14px; }

    .panel { background: #1a0f35; border-radius: 14px; padding: 14px; border: 1px solid rgba(255,255,255,0.1); }
    .panel-header { font-size: 13px; font-weight: 700; padding: 6px 10px; border-radius: 8px; margin-bottom: 12px; }
    .panel-header.boy { background: rgba(99,102,241,0.2); color: #818cf8; }
    .panel-header.girl { background: rgba(236,72,153,0.2); color: #f472b6; }

    label { font-size: 10px; color: #8a8ab0; display: block; margin: 8px 0 3px; }
    .field { width: 100%; box-sizing: border-box; padding: 9px 10px; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 12px; }

    .submit-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #d4af37, #aa7c11); border: none; border-radius: 12px; color: #000; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 18px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .error-msg { color: #f87171; font-size: 12px; text-align: center; margin-top: 10px; }

    /* Result styles */
    .result-header { display: flex; gap: 14px; padding: 18px; border-radius: 16px; align-items: center; margin-bottom: 16px; }
    .result-header.match { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.4); }
    .result-header.nomatch { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); }
    .big-score { display: flex; align-items: baseline; }
    .score-num { font-size: 40px; font-weight: 800; color: #fff; }
    .score-max { font-size: 16px; color: #8a8ab0; }
    .result-info h2 { margin: 0 0 4px; font-size: 16px; color: #fff; }
    .result-info p { margin: 0; font-size: 12px; color: #8a8ab0; }
    .result-msg { color: #d0d0f0 !important; font-style: italic; margin-top: 4px !important; }

    .score-ring-wrap { display: flex; justify-content: center; padding: 20px 0; }
    .score-ring { width: 130px; height: 130px; }

    .breakdown-list { background: #160f33; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
    .breakdown-list h3 { color: #ffd700; font-size: 14px; margin: 0 0 12px; }
    .porutham-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.07); font-size: 13px; }
    .porutham-name { color: #d0d0f0; }
    .porutham-result.match { color: #4ade80; }
    .porutham-result.nomatch { color: #f87171; }

    .consultation-cta { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 14px; padding: 16px; text-align: center; margin-bottom: 12px; }
    .consultation-cta p { color: #d0d0f0; font-size: 13px; margin: 0 0 10px; }
    .cta-btn { padding: 10px 20px; background: #ffd700; color: #000; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; }
    .reset-btn { width: 100%; padding: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #fff; font-size: 13px; cursor: pointer; }
  `]
})
export class MatchingComponent {
  rasiList = RASIS;
  nakshatras = NAKSHATRAS;
  step: 'form' | 'result' = 'form';
  loading = false;
  errorMsg = '';
  result: any = null;

  form = {
    boy_name: '', boy_dob: '', boy_tob: '', boy_pob: '', boy_rasi: '', boy_nakshatra: '',
    girl_name: '', girl_dob: '', girl_tob: '', girl_pob: '', girl_rasi: '', girl_nakshatra: ''
  };

  constructor(private http: HttpClient) {}

  calculate() {
    if (!this.form.boy_name || !this.form.boy_dob || !this.form.boy_rasi ||
        !this.form.girl_name || !this.form.girl_dob || !this.form.girl_rasi) {
      this.errorMsg = 'அனைத்து கட்டாய விவரங்களையும் நிரப்பவும்.';
      return;
    }
    this.errorMsg = '';
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/jathagam/match`, this.form).subscribe({
      next: res => { this.result = res; this.step = 'result'; this.loading = false; },
      error: () => { this.errorMsg = 'பிழை ஏற்பட்டது. மீண்டும் முயலவும்.'; this.loading = false; }
    });
  }

  reset() { this.step = 'form'; this.result = null; }
}
