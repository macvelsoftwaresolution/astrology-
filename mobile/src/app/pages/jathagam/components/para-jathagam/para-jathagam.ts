import { environment } from '../../../../../environments/environment';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonSpinner } from '@ionic/angular/standalone';

const RASIS = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
];
const RASI_SYMBOLS: Record<string, string> = {
  'மேஷம்': '♈', 'ரிஷபம்': '♉', 'மிதுனம்': '♊', 'கடகம்': '♋',
  'சிம்மம்': '♌', 'கன்னி': '♍', 'துலாம்': '♎', 'விருச்சிகம்': '♏',
  'தனுசு': '♐', 'மகரம்': '♑', 'கும்பம்': '♒', 'மீனம்': '♓'
};

import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { SegmentedDobComponent } from '../../../../components/segmented-dob/segmented-dob.component';

@Component({
  selector: 'app-para-jathagam',
  standalone: true,
  imports: [CommonModule, FormsModule, IonSpinner, TranslatePipe, SegmentedDobComponent],
  template: `
    <div class="para-wrapper">
      <div class="section-header">
        <h2>🔭 பரஜாதகம்</h2>
        <p>வேறொருவரின் பிறப்பு விவரங்களை உள்ளிட்டு அவர் ராசி பலன் தெரிந்துகொள்ளுங்கள்</p>
      </div>

      @if (!result) {
        <div class="form-card">
          <div class="form-group">
            <label>பெயர் *</label>
            <input [(ngModel)]="form.name" placeholder="அவர் பெயர்" class="field"/>
          </div>
          <div class="form-group">
            <label>பிறந்த தேதி *</label>
            <app-segmented-dob [(value)]="form.dob"></app-segmented-dob>
          </div>
          <div class="form-group">
            <label>பிறந்த நேரம்</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <input type="tel" [(ngModel)]="paraTobDisplay" (input)="formatParaTobDisplay($event)" placeholder="HH:MM" maxlength="5" class="field" style="flex: 1; min-width: 80px;"/>
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; flex-shrink: 0; padding-bottom: 10px;">
                <input type="radio" [(ngModel)]="paraTobAmPm" (change)="updateParaTobBackend()" value="AM" name="pAmPm" id="pAM"><label for="pAM">AM</label>
                <input type="radio" [(ngModel)]="paraTobAmPm" (change)="updateParaTobBackend()" value="PM" name="pAmPm" id="pPM"><label for="pPM">PM</label>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>பிறந்த ஊர்</label>
            <input [(ngModel)]="form.pob" placeholder="e.g. Chennai" class="field"/>
          </div>
          <div class="form-group">
            <label>ராசி *</label>
            <select [(ngModel)]="form.rasi" class="field">
              <option value="">-- ராசி தேர்வு --</option>
              @for (r of rasiList; track r) {
                <option [value]="r">{{ r }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>நட்சத்திரம்</label>
            <input [(ngModel)]="form.nakshatra" placeholder="நட்சத்திரம் (Optional)" class="field"/>
          </div>

          <button class="submit-btn" (click)="getReading()" [disabled]="loading">
            @if (loading) {
              <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner>
            } @else {
              <span>🔮 பலன் காண்</span>
            }
          </button>
          @if (errorMsg) {
            <p class="error-msg">{{ errorMsg | translate }}</p>
          }
        </div>
      }

      <!-- Result Card -->
      @if (result) {
        <div class="result-card">
          <div class="result-hero">
            <span class="big-symbol">{{ getSymbol(result.rasi) }}</span>
            <div>
              <h2>{{ result.name }}</h2>
              <span class="rasi-tag">{{ result.rasi }}</span>
              @if (result.nakshatra) {
                <span class="nak-tag">{{ result.nakshatra }}</span>
              }
            </div>
          </div>

          <div class="prediction-box">
            <h4>இன்றைய ராசி பலன்</h4>
            <p>{{ result.prediction_text }}</p>
          </div>

          <div class="meta-row">
            <span>📅 பிறந்த தேதி: {{ result.dob | date:'dd MMM yyyy' }}</span>
          </div>

          <!-- CTA to book detailed reading -->
          <div class="consult-cta">
            <p>முழு ஜாதக பலன் வேண்டுமா?</p>
            <button class="book-btn">📅 விரிவான ஆலோசனை பதிவு செய்யுங்கள்</button>
          </div>

          <button class="reset-btn" (click)="result = null">← மீண்டும் தேட</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .para-wrapper { padding: 12px 14px 80px; }
    .section-header { margin-bottom: 16px; }
    .section-header h2 { color: #ffd700; font-size: 18px; margin: 0 0 4px; }
    .section-header p { color: #8a8ab0; font-size: 12px; margin: 0; }

    .form-card { background: #160f33; border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.1); }
    .form-group { margin-bottom: 12px; }
    label { font-size: 10px; color: #8a8ab0; display: block; margin-bottom: 4px; }
    .field { width: 100%; box-sizing: border-box; padding: 10px; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 13px; }

    .submit-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #d4af37, #aa7c11); border: none; border-radius: 10px; color: #000; font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .error-msg { color: #f87171; font-size: 12px; margin-top: 8px; }

    .result-card { background: linear-gradient(135deg, #1a0f35, #160b2c); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 20px; }
    .result-hero { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
    .big-symbol { font-size: 50px; }
    .result-hero h2 { color: #fff; font-size: 20px; margin: 0 0 6px; }
    .rasi-tag { background: rgba(212,175,55,0.2); color: #ffd700; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; margin-right: 6px; }
    .nak-tag { background: rgba(168,85,247,0.15); color: #d8b4fe; padding: 3px 10px; border-radius: 12px; font-size: 12px; }

    .prediction-box { background: rgba(255,255,255,0.04); padding: 16px; border-radius: 12px; margin-bottom: 12px; }
    .prediction-box h4 { color: #ffd700; font-size: 13px; margin: 0 0 8px; }
    .prediction-box p { color: #d0d0f0; font-size: 13px; line-height: 1.7; margin: 0; }

    .meta-row { font-size: 11px; color: #8a8ab0; margin-bottom: 14px; }
    .consult-cta { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 12px; }
    .consult-cta p { color: #d0d0f0; font-size: 12px; margin: 0 0 8px; }
    .book-btn { padding: 8px 16px; background: #ffd700; color: #000; border: none; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; }
    .reset-btn { width: 100%; padding: 11px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #fff; font-size: 13px; cursor: pointer; }
  `]
})
export class ParaJathagamComponent {
  rasiList = RASIS;
  form = { name: '', dob: '', tob: '', pob: '', rasi: '', nakshatra: '' };
  result: any = null;
  loading = false;
  errorMsg = '';
  
  paraDobDisplay = '';
  paraTobDisplay = '';
  paraTobAmPm = 'AM';

  constructor(private http: HttpClient) {}

  formatParaDobDisplay(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length >= 3 && val.length <= 4) formatted = val.slice(0, 2) + '/' + val.slice(2);
    else if (val.length >= 5) formatted = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
    this.paraDobDisplay = formatted;
    event.target.value = formatted;
    if (val.length === 8) {
      this.form.dob = `${val.slice(4, 8)}-${val.slice(2, 4)}-${val.slice(0, 2)}`;
    } else this.form.dob = '';
  }

  formatParaTobDisplay(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length >= 3) formatted = val.slice(0, 2) + ':' + val.slice(2, 4);
    this.paraTobDisplay = formatted;
    event.target.value = formatted;
    this.updateParaTobBackend();
  }

  updateParaTobBackend() {
    if (this.paraTobDisplay && this.paraTobDisplay.replace(/\D/g, '').length === 4) {
      let val = this.paraTobDisplay.replace(/\D/g, '');
      let h = parseInt(val.slice(0, 2) || '0', 10);
      let mStr = val.slice(2, 4);
      if (this.paraTobAmPm === 'PM' && h < 12) h += 12;
      if (this.paraTobAmPm === 'AM' && h === 12) h = 0;
      this.form.tob = `${h.toString().padStart(2, '0')}:${mStr.padStart(2, '0')}`;
    } else this.form.tob = '';
  }

  getSymbol(rasi: string) { return RASI_SYMBOLS[rasi] ?? '⭐'; }

  getReading() {
    if (!this.form.name || !this.form.dob || !this.form.rasi) {
      this.errorMsg = 'errors.nameDobRasiRequired';
      return;
    }
    this.errorMsg = '';
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/jathagam/para-reading`, this.form).subscribe({
      next: res => { this.result = res; this.loading = false; },
      error: () => { this.errorMsg = 'errors.somethingWentWrong'; this.loading = false; }
    });
  }
}
