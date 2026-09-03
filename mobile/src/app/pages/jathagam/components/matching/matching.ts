import { environment } from '../../../../../environments/environment';
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { SegmentedDobComponent } from '../../../../components/segmented-dob/segmented-dob.component';

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
  imports: [CommonModule, FormsModule, IonSpinner, TranslatePipe, SegmentedDobComponent],
  template: `
    <div class="matching-wrapper">

      <!-- STEP 1: FORM -->
      @if (step === 'form') {
        <div>
          <div class="section-title">
            <h2><i class="bi bi-heart-fill me-1 text-danger"></i> திருமண பொருத்தம்</h2>
            <p>பையன் மற்றும் பெண் ஜாதக விவரங்களை உள்ளிடவும்</p>
          </div>

          <div class="two-panel">
            <!-- Boy Panel -->
            <div class="panel boy-panel">
              <div class="panel-header boy"><i class="bi bi-person-fill me-1"></i> பையன் விவரம்</div>
              <label>பெயர்</label>
              <input [(ngModel)]="form.boy_name" placeholder="பையன் பெயர்" class="field"/>
              <label>பிறந்த தேதி</label>
              <app-segmented-dob [(value)]="form.boy_dob"></app-segmented-dob>
              <label>பிறந்த நேரம்</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <input type="tel" [(ngModel)]="boyTobDisplay" (input)="formatBoyTobDisplay($event)" placeholder="HH:MM" maxlength="5" class="field" style="flex: 1; min-width: 80px;"/>
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; flex-shrink: 0; padding-bottom: 10px;">
                  <input type="radio" [(ngModel)]="boyTobAmPm" (change)="updateBoyTobBackend()" value="AM" name="bAmPm" id="bAM"><label for="bAM">AM</label>
                  <input type="radio" [(ngModel)]="boyTobAmPm" (change)="updateBoyTobBackend()" value="PM" name="bAmPm" id="bPM"><label for="bPM">PM</label>
                </div>
              </div>
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
              <div class="panel-header girl"><i class="bi bi-person-heart me-1"></i> பெண் விவரம்</div>
              <label>பெயர்</label>
              <input [(ngModel)]="form.girl_name" placeholder="பெண் பெயர்" class="field"/>
              <label>பிறந்த தேதி</label>
              <app-segmented-dob [(value)]="form.girl_dob"></app-segmented-dob>
              <label>பிறந்த நேரம்</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <input type="tel" [(ngModel)]="girlTobDisplay" (input)="formatGirlTobDisplay($event)" placeholder="HH:MM" maxlength="5" class="field" style="flex: 1; min-width: 80px;"/>
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; flex-shrink: 0; padding-bottom: 10px;">
                  <input type="radio" [(ngModel)]="girlTobAmPm" (change)="updateGirlTobBackend()" value="AM" name="gAmPm" id="gAM"><label for="gAM">AM</label>
                  <input type="radio" [(ngModel)]="girlTobAmPm" (change)="updateGirlTobBackend()" value="PM" name="gAmPm" id="gPM"><label for="gPM">PM</label>
                </div>
              </div>
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
              <span><i class="bi bi-search me-1"></i> பொருத்தம் கண்டுபிடி</span>
            }
          </button>

          @if (errorMsg) {
            <p class="error-msg">{{ errorMsg | translate }}</p>
          }
        </div>
      }

      <!-- STEP 2: RESULT -->
      @if (step === 'result' && result) {
        <div>
          <!-- OFFICIAL ASTROLOGER MATCHING REPORT CARD (If report_data is filled by admin) -->
          @if (result.report_data) {
            <div class="official-report-card" id="printable-report">
              <!-- Header -->
              <div class="report-header">
                <div class="report-god-title">ஓம் நமச்சிவாய</div>
                <h2 class="report-astro-title">{{ result.report_data.astrologer_title || 'ஓம் பிரகாஷ்பதி ஜோதிடாலயம்' }}</h2>
                <div class="report-astro-sub">{{ result.report_data.astrologer_name || 'தலைமை ஜோதிடர்' }}</div>
                <div class="report-astro-contact">{{ result.report_data.astrologer_address }} | {{ result.report_data.astrologer_phone }}</div>
                <h1 class="report-main-heading">திருமணப் பொருத்தம் அறிக்கை</h1>
              </div>

              <!-- Couple Info Table -->
              <div class="report-couple-grid">
                <div class="couple-box girl">
                  <h3><i class="bi bi-person-heart me-1"></i> பெண் ஜாதகி</h3>
                  <div class="row"><span>பெயர்:</span> <strong>{{ result.report_data.girl_name || result.girl_name }}</strong></div>
                  <div class="row"><span>நட்சத்திரம்:</span> <strong>{{ result.report_data.girl_star || result.girl_nakshatra }}</strong></div>
                  <div class="row"><span>ராசி:</span> <strong>{{ result.report_data.girl_rasi || result.girl_rasi }}</strong></div>
                  @if (result.report_data.girl_age) { <div class="row"><span>வயது:</span> <strong>{{ result.report_data.girl_age }}</strong></div> }
                  @if (result.report_data.girl_mirugam) { <div class="row"><span>மிருகம்:</span> <strong>{{ result.report_data.girl_mirugam }}</strong></div> }
                  @if (result.report_data.girl_patshi) { <div class="row"><span>பட்சி:</span> <strong>{{ result.report_data.girl_patshi }}</strong></div> }
                  @if (result.report_data.girl_maram) { <div class="row"><span>மரம்:</span> <strong>{{ result.report_data.girl_maram }}</strong></div> }
                  @if (result.report_data.girl_ganam) { <div class="row"><span>கணம்:</span> <strong>{{ result.report_data.girl_ganam }}</strong></div> }
                  @if (result.report_data.girl_nadi) { <div class="row"><span>நாடி:</span> <strong>{{ result.report_data.girl_nadi }}</strong></div> }
                </div>

                <div class="couple-box boy">
                  <h3><i class="bi bi-person-fill me-1"></i> ஆண் ஜாதகர்</h3>
                  <div class="row"><span>பெயர்:</span> <strong>{{ result.report_data.boy_name || result.boy_name }}</strong></div>
                  <div class="row"><span>நட்சத்திரம்:</span> <strong>{{ result.report_data.boy_star || result.boy_nakshatra }}</strong></div>
                  <div class="row"><span>ராசி:</span> <strong>{{ result.report_data.boy_rasi || result.boy_rasi }}</strong></div>
                  @if (result.report_data.boy_age) { <div class="row"><span>வயது:</span> <strong>{{ result.report_data.boy_age }}</strong></div> }
                  @if (result.report_data.boy_mirugam) { <div class="row"><span>மிருகம்:</span> <strong>{{ result.report_data.boy_mirugam }}</strong></div> }
                  @if (result.report_data.boy_patshi) { <div class="row"><span>பட்சி:</span> <strong>{{ result.report_data.boy_patshi }}</strong></div> }
                  @if (result.report_data.boy_maram) { <div class="row"><span>மரம்:</span> <strong>{{ result.report_data.boy_maram }}</strong></div> }
                  @if (result.report_data.boy_ganam) { <div class="row"><span>கணம்:</span> <strong>{{ result.report_data.boy_ganam }}</strong></div> }
                  @if (result.report_data.boy_nadi) { <div class="row"><span>நாடி:</span> <strong>{{ result.report_data.boy_nadi }}</strong></div> }
                </div>
              </div>

              <!-- 11 Poruthangal Table -->
              <div class="porutham-table-wrap">
                <h4><i class="bi bi-list-check me-1"></i> 11 திருமணப் பொருத்தங்கள் பட்டியல்</h4>
                <div class="porutham-grid">
                  @for (p of result.report_data.poruthangal; track p.name) {
                    <div class="porutham-item">
                      <span class="p-name">{{ p.name }}</span>
                      <span class="p-status" [class.pass]="p.status === 'பொருந்தும்'" [class.warn]="p.status === 'சுமார்'" [class.fail]="p.status === 'பொருந்தாது'">
                        {{ p.status }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Horoscope House Analysis -->
              @if (result.report_data.girl_house_2 || result.report_data.boy_house_2 || result.report_data.girl_analysis || result.report_data.boy_analysis) {
                <div class="house-analysis-wrap">
                  <h4><i class="bi bi-brightness-alt-high me-1"></i> ஜாதகப் பொருத்தல் & தோஷ ஆய்வுகள்</h4>
                  <div class="house-grid">
                    <div class="h-col girl-h">
                      <h5>பெண் ஜாதக ஆய்வு</h5>
                      @if (result.report_data.girl_house_2) { <p><strong>2மிடம் (குடும்பம்):</strong> {{ result.report_data.girl_house_2 }}</p> }
                      @if (result.report_data.girl_house_5) { <p><strong>5மிடம் (புத்திர பாக்கியம்):</strong> {{ result.report_data.girl_house_5 }}</p> }
                      @if (result.report_data.girl_house_7) { <p><strong>7மிடம் (களத்திரம்):</strong> {{ result.report_data.girl_house_7 }}</p> }
                      @if (result.report_data.girl_guru_balam) { <p><strong>குருபலம்:</strong> {{ result.report_data.girl_guru_balam }}</p> }
                      @if (result.report_data.girl_dosham) { <p><strong>தோஷ அமைப்புகள்:</strong> {{ result.report_data.girl_dosham }}</p> }
                      @if (result.report_data.girl_dhasa_sandhi) { <p><strong>திசா சந்தி:</strong> {{ result.report_data.girl_dhasa_sandhi }}</p> }
                      @if (result.report_data.girl_analysis) { <p class="analysis-text"><strong>ஜோதிடர் ஆய்வு:</strong> {{ result.report_data.girl_analysis }}</p> }
                    </div>

                    <div class="h-col boy-h">
                      <h5>ஆண் ஜாதக ஆய்வு</h5>
                      @if (result.report_data.boy_house_2) { <p><strong>2மிடம் (குடும்பம்):</strong> {{ result.report_data.boy_house_2 }}</p> }
                      @if (result.report_data.boy_house_5) { <p><strong>5மிடம் (புத்திர பாக்கியம்):</strong> {{ result.report_data.boy_house_5 }}</p> }
                      @if (result.report_data.boy_house_7) { <p><strong>7மிடம் (களத்திரம்):</strong> {{ result.report_data.boy_house_7 }}</p> }
                      @if (result.report_data.boy_guru_balam) { <p><strong>குருபலம்:</strong> {{ result.report_data.boy_guru_balam }}</p> }
                      @if (result.report_data.boy_dosham) { <p><strong>தோஷ அமைப்புகள்:</strong> {{ result.report_data.boy_dosham }}</p> }
                      @if (result.report_data.boy_dhasa_sandhi) { <p><strong>திசா சந்தி:</strong> {{ result.report_data.boy_dhasa_sandhi }}</p> }
                      @if (result.report_data.boy_analysis) { <p class="analysis-text"><strong>ஜோதிடர் ஆய்வு:</strong> {{ result.report_data.boy_analysis }}</p> }
                    </div>
                  </div>
                </div>
              }

              <!-- Summary Verdict Box -->
              <div class="report-verdict-box">
                <div class="verdict-top">
                  <span class="v-total">மொத்தப்பொருத்தம்: <strong>{{ result.report_data.total_porutham || '8 / 10 பொருத்தம்' }}</strong></span>
                  <span class="v-imp"><strong>{{ result.report_data.important_porutham || 'முக்கிய பொருத்தம் உண்டு' }}</strong></span>
                </div>
                <div class="verdict-opinion">
                  <strong>ஜோதிடர் கருத்து:</strong> {{ result.report_data.astrologer_opinion }}
                </div>
              </div>

              <!-- Print / Download PDF Action Button -->
              <div class="print-action-bar no-print">
                <button class="btn-print-pdf" (click)="printReport()">
                  <i class="bi bi-printer me-1"></i> அச்சிடுக / PDF ஆக பதிவிறக்குக (Print / Download PDF)
                </button>
              </div>
            </div>
          } @else {
            <!-- STANDARD QUICK MATCH SUMMARY -->
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
          }

          <!-- Book Detailed Consultation -->
          <div class="consultation-cta no-print">
            <p>மேலும் விவரமான ஜாதக ஆலோசனை வேண்டுமா?</p>
            <button class="cta-btn">📅 Appointment Book செய்யுங்கள்</button>
          </div>

          <button class="reset-btn no-print" (click)="reset()">← மீண்டும் தேட</button>
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

    .breakdown-list { background: #160f33; border-radius: 14px; padding: 16px; margin-bottom: 16px; }
    .breakdown-list h3 { color: #ffd700; font-size: 14px; margin: 0 0 12px; }
    .porutham-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.07); font-size: 13px; }
    .porutham-name { color: #d0d0f0; }
    .porutham-result.match { color: #4ade80; }
    .porutham-result.nomatch { color: #f87171; }

    /* OFFICIAL REPORT CARD STYLING */
    .official-report-card {
      background: #ffffff;
      color: #0f172a;
      border: 2px solid #d97706;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .report-header { text-align: center; border-bottom: 2px solid #fef3c7; padding-bottom: 12px; margin-bottom: 16px; }
    .report-god-title { font-size: 13px; font-weight: 700; color: #b45309; margin-bottom: 2px; }
    .report-astro-title { font-size: 18px; font-weight: 800; color: #78350f; margin: 0 0 4px 0; }
    .report-astro-sub { font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 2px; }
    .report-astro-contact { font-size: 11px; color: #475569; margin-bottom: 10px; }
    .report-main-heading { font-size: 16px; font-weight: 800; color: #ffffff; background: linear-gradient(135deg, #d97706, #b45309); display: inline-block; padding: 6px 18px; border-radius: 20px; margin: 0; }

    .report-couple-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .couple-box { border-radius: 12px; padding: 12px; font-size: 12px; }
    .couple-box.girl { background: #fff1f2; border: 1px solid #fecdd3; }
    .couple-box.boy { background: #eff6ff; border: 1px solid #bfdbfe; }
    .couple-box h3 { margin: 0 0 8px 0; font-size: 13px; font-weight: 800; }
    .couple-box.girl h3 { color: #e11d48; }
    .couple-box.boy h3 { color: #2563eb; }
    .couple-box .row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed rgba(0,0,0,0.06); }
    .couple-box .row span { color: #64748b; }
    .couple-box .row strong { color: #0f172a; }

    .porutham-table-wrap { margin-bottom: 16px; }
    .porutham-table-wrap h4 { font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
    .porutham-grid { display: grid; grid-template-columns: 1fr; gap: 6px; }
    .porutham-item { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; padding: 7px 12px; border-radius: 8px; font-size: 12px; }
    .p-name { font-weight: 700; color: #1e293b; }
    .p-status { font-weight: 800; padding: 2px 8px; border-radius: 6px; }
    .p-status.pass { background: #dcfce7; color: #166534; }
    .p-status.warn { background: #fef3c7; color: #92400e; }
    .p-status.fail { background: #fee2e2; color: #991b1b; }

    .house-analysis-wrap { margin-bottom: 16px; }
    .house-analysis-wrap h4 { font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
    .house-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .h-col { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; font-size: 11px; }
    .h-col h5 { margin: 0 0 6px 0; font-size: 12px; font-weight: 800; }
    .h-col.girl-h h5 { color: #e11d48; }
    .h-col.boy-h h5 { color: #2563eb; }
    .h-col p { margin: 0 0 4px 0; color: #334155; }
    .analysis-text { background: #fff; padding: 6px; border-radius: 6px; border: 1px solid #cbd5e1; margin-top: 6px !important; }

    .report-verdict-box { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 14px; margin-bottom: 16px; }
    .verdict-top { display: flex; justify-content: space-between; font-size: 13px; color: #166534; margin-bottom: 8px; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; }
    .verdict-opinion { font-size: 12.5px; color: #14532d; line-height: 1.4; }

    .print-action-bar { text-align: center; margin-top: 14px; }
    .btn-print-pdf { background: #2563eb; color: #ffffff; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

    .consultation-cta { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); border-radius: 14px; padding: 16px; text-align: center; margin-bottom: 12px; }
    .consultation-cta p { color: #d0d0f0; font-size: 13px; margin: 0 0 10px; }
    .cta-btn { padding: 10px 20px; background: #ffd700; color: #000; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; }
    .reset-btn { width: 100%; padding: 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #fff; font-size: 13px; cursor: pointer; }

    @media print {
      .no-print { display: none !important; }
      .official-report-card { border: none; box-shadow: none; padding: 0; }
    }
  `]
})
export class MatchingComponent {
  @Input() set initialData(data: any) {
    if (data) {
      this.result = data;
      this.step = 'result';
    }
  }

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

  boyDobDisplay = '';
  boyTobDisplay = '';
  boyTobAmPm = 'AM';
  
  girlDobDisplay = '';
  girlTobDisplay = '';
  girlTobAmPm = 'AM';

  constructor(private http: HttpClient) {}

  formatBoyDobDisplay(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length >= 3 && val.length <= 4) formatted = val.slice(0, 2) + '/' + val.slice(2);
    else if (val.length >= 5) formatted = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
    this.boyDobDisplay = formatted;
    event.target.value = formatted;
    if (val.length === 8) {
      this.form.boy_dob = `${val.slice(4, 8)}-${val.slice(2, 4)}-${val.slice(0, 2)}`;
    } else this.form.boy_dob = '';
  }

  formatBoyTobDisplay(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length >= 3) formatted = val.slice(0, 2) + ':' + val.slice(2, 4);
    this.boyTobDisplay = formatted;
    event.target.value = formatted;
    this.updateBoyTobBackend();
  }

  updateBoyTobBackend() {
    if (this.boyTobDisplay && this.boyTobDisplay.replace(/\D/g, '').length === 4) {
      let val = this.boyTobDisplay.replace(/\D/g, '');
      let h = parseInt(val.slice(0, 2) || '0', 10);
      let mStr = val.slice(2, 4);
      if (this.boyTobAmPm === 'PM' && h < 12) h += 12;
      if (this.boyTobAmPm === 'AM' && h === 12) h = 0;
      this.form.boy_tob = `${h.toString().padStart(2, '0')}:${mStr.padStart(2, '0')}`;
    } else this.form.boy_tob = '';
  }

  formatGirlDobDisplay(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length >= 3 && val.length <= 4) formatted = val.slice(0, 2) + '/' + val.slice(2);
    else if (val.length >= 5) formatted = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
    this.girlDobDisplay = formatted;
    event.target.value = formatted;
    if (val.length === 8) {
      this.form.girl_dob = `${val.slice(4, 8)}-${val.slice(2, 4)}-${val.slice(0, 2)}`;
    } else this.form.girl_dob = '';
  }

  formatGirlTobDisplay(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length >= 3) formatted = val.slice(0, 2) + ':' + val.slice(2, 4);
    this.girlTobDisplay = formatted;
    event.target.value = formatted;
    this.updateGirlTobBackend();
  }

  updateGirlTobBackend() {
    if (this.girlTobDisplay && this.girlTobDisplay.replace(/\D/g, '').length === 4) {
      let val = this.girlTobDisplay.replace(/\D/g, '');
      let h = parseInt(val.slice(0, 2) || '0', 10);
      let mStr = val.slice(2, 4);
      if (this.girlTobAmPm === 'PM' && h < 12) h += 12;
      if (this.girlTobAmPm === 'AM' && h === 12) h = 0;
      this.form.girl_tob = `${h.toString().padStart(2, '0')}:${mStr.padStart(2, '0')}`;
    } else this.form.girl_tob = '';
  }

  calculate() {
    if (!this.form.boy_name || !this.form.boy_dob || !this.form.boy_rasi ||
        !this.form.girl_name || !this.form.girl_dob || !this.form.girl_rasi) {
      this.errorMsg = 'errors.fillRequiredFields';
      return;
    }
    this.errorMsg = '';
    this.loading = true;
    this.http.post<any>(`${environment.apiUrl}/jathagam/match`, this.form).subscribe({
      next: res => { this.result = res; this.step = 'result'; this.loading = false; },
      error: () => { this.errorMsg = 'errors.somethingWentWrong'; this.loading = false; }
    });
  }

  reset() { this.step = 'form'; this.result = null; }

  printReport() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
