import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  selector: 'app-my-jathagam',
  standalone: true,
  imports: [CommonModule, FormsModule, IonSpinner],
  template: `
    <div class="my-jathagam-wrapper">
      <div class="section-header">
        <h2>📜 என் ஜாதகம்</h2>
        <p>உங்கள் பிறப்பு விவரங்களை சேமியுங்கள்</p>
      </div>

      <!-- Existing Jathagam Display -->
      @if (saved && !editing) {
        <div class="saved-card">
          <div class="saved-header">
            <span class="rasi-badge">{{ saved.rasi || 'ராசி' }}</span>
            <button class="edit-btn" (click)="startEdit()">✏️ திருத்தம்</button>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">பிறந்த தேதி</span>
              <span class="info-val">{{ saved.dob | date:'dd MMM yyyy' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">பிறந்த நேரம்</span>
              <span class="info-val">{{ saved.tob || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">பிறந்த ஊர்</span>
              <span class="info-val">{{ saved.pob || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ராசி</span>
              <span class="info-val gold">{{ saved.rasi }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">நட்சத்திரம்</span>
              <span class="info-val">{{ saved.nakshatra || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">லக்னம்</span>
              <span class="info-val">{{ saved.lagnam || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">பாலினம்</span>
              <span class="info-val">{{ saved.gender || 'N/A' }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Form (Edit / New) -->
      @if (!saved || editing) {
        <div class="form-card">
          <div class="form-group">
            <label>பிறந்த தேதி *</label>
            <input type="date" [(ngModel)]="form.dob" class="field"/>
          </div>
          <div class="form-group">
            <label>பிறந்த நேரம்</label>
            <input type="time" [(ngModel)]="form.tob" class="field"/>
          </div>
          <div class="form-group">
            <label>பிறந்த ஊர்</label>
            <input [(ngModel)]="form.pob" placeholder="e.g. Chennai, Madurai" class="field"/>
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
            <select [(ngModel)]="form.nakshatra" class="field">
              <option value="">-- நட்சத்திரம் --</option>
              @for (n of nakshatras; track n) {
                <option [value]="n">{{ n }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>லக்னம்</label>
            <select [(ngModel)]="form.lagnam" class="field">
              <option value="">-- லக்னம் --</option>
              @for (r of rasiList; track r) {
                <option [value]="r">{{ r }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>பாலினம்</label>
            <select [(ngModel)]="form.gender" class="field">
              <option value="Male">ஆண்</option>
              <option value="Female">பெண்</option>
            </select>
          </div>

          <div class="form-btns">
            @if (editing) {
              <button class="cancel-btn" (click)="cancelEdit()">ரத்து</button>
            }
            <button class="save-btn" (click)="save()" [disabled]="saving">
              @if (saving) {
                <ion-spinner name="crescent" style="width:16px;height:16px"></ion-spinner>
              } @else {
                <span>💾 சேமி</span>
              }
            </button>
          </div>

          @if (errorMsg) {
            <p class="error-msg">{{ errorMsg }}</p>
          }
          @if (successMsg) {
            <p class="success-msg">✅ {{ successMsg }}</p>
          }
        </div>
      }

      <!-- Loading state -->
      @if (loading) {
        <div class="center-loader">
          <ion-spinner name="crescent" color="warning"></ion-spinner>
        </div>
      }
    </div>
  `,
  styles: [`
    .my-jathagam-wrapper { padding: 12px 14px 80px; }
    .section-header { margin-bottom: 16px; }
    .section-header h2 { color: #ffd700; font-size: 18px; margin: 0 0 4px; }
    .section-header p { color: #8a8ab0; font-size: 12px; margin: 0; }

    .saved-card { background: linear-gradient(135deg, #1a0f35, #160b2c); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 18px; }
    .saved-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .rasi-badge { background: rgba(212,175,55,0.2); color: #ffd700; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 14px; }
    .edit-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-item { background: rgba(255,255,255,0.04); padding: 10px 12px; border-radius: 10px; }
    .info-label { display: block; font-size: 10px; color: #8a8ab0; margin-bottom: 3px; }
    .info-val { font-size: 13px; color: #fff; font-weight: 600; }
    .info-val.gold { color: #ffd700; }

    .form-card { background: #160f33; border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.1); }
    .form-group { margin-bottom: 12px; }
    label { font-size: 10px; color: #8a8ab0; display: block; margin-bottom: 4px; }
    .field { width: 100%; box-sizing: border-box; padding: 10px; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 13px; }

    .form-btns { display: flex; gap: 10px; margin-top: 16px; }
    .save-btn { flex: 1; padding: 12px; background: linear-gradient(135deg, #d4af37, #aa7c11); border: none; border-radius: 10px; color: #000; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .cancel-btn { padding: 12px 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: #fff; font-size: 13px; cursor: pointer; }
    .error-msg { color: #f87171; font-size: 12px; margin-top: 8px; }
    .success-msg { color: #4ade80; font-size: 12px; margin-top: 8px; }
    .center-loader { text-align: center; padding: 40px; }
  `]
})
export class MyJathagamComponent implements OnInit {
  rasiList = RASIS;
  nakshatras = NAKSHATRAS;
  saved: any = null;
  editing = false;
  loading = false;
  saving = false;
  errorMsg = '';
  successMsg = '';

  form = { dob: '', tob: '', pob: '', rasi: '', nakshatra: '', lagnam: '', gender: 'Male' };

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadSaved(); }

  loadSaved() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    this.loading = true;
    this.http.get<any>('http://127.0.0.1:8000/api/user/jathagam', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => { this.saved = res.jathagam_details; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  startEdit() {
    this.form = { ...this.saved };
    this.editing = true;
  }

  cancelEdit() { this.editing = false; }

  save() {
    if (!this.form.dob || !this.form.rasi) {
      this.errorMsg = 'பிறந்த தேதி மற்றும் ராசி கட்டாயம்.';
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) { this.errorMsg = 'உள்நுழைவு செய்யவும்.'; return; }
    this.saving = true;
    this.errorMsg = '';
    this.http.post<any>('http://127.0.0.1:8000/api/user/jathagam', this.form, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: res => {
        this.saved = res.jathagam_details;
        this.editing = false;
        this.saving = false;
        this.successMsg = 'ஜாதக விவரங்கள் சேமிக்கப்பட்டன!';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.errorMsg = 'சேமிப்பில் பிழை ஏற்பட்டது.'; this.saving = false; }
    });
  }
}
