import { environment } from '../../../../../environments/environment';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-vastu-kanitha',
  standalone: true,
  imports: [CommonModule, FormsModule, IonSpinner],
  template: `
    <div class="vk-wrapper">
      <!-- Service Type Toggle -->
      <div class="service-toggle">
        <button [class.active]="serviceType === 'vastu'" (click)="serviceType = 'vastu'">
          🏠 வாஸ்து சோதனை
        </button>
        <button [class.active]="serviceType === 'kanitha'" (click)="serviceType = 'kanitha'">
          🔢 கணித ஜோதிடம்
        </button>
      </div>

      <!-- VASTU FORM -->
      @if (serviceType === 'vastu') {
        <div class="form-card">
          <div class="service-intro">
            <h2>🏠 வாஸ்து சோதனை</h2>
            <p>உங்கள் வீடு / நிலம் / தொழில் இடத்தின் வாஸ்து நிலையை அறிந்துகொள்ளுங்கள்.</p>
            <div class="price-chip">₹999 / Consultation</div>
          </div>

          <div class="form-group">
            <label>உங்கள் பெயர் *</label>
            <input [(ngModel)]="vastuForm.name" placeholder="பெயர்" class="field"/>
          </div>
          <div class="form-group">
            <label>தொடர்பு எண் *</label>
            <input type="tel" [(ngModel)]="vastuForm.phone" placeholder="+91 99999 99999" class="field"/>
          </div>
          <div class="form-group">
            <label>சொத்து வகை *</label>
            <select [(ngModel)]="vastuForm.property_type" class="field">
              <option value="Home">வீடு (Home)</option>
              <option value="Plot">நிலம் (Plot)</option>
              <option value="Shop">கடை (Shop)</option>
              <option value="Office">அலுவலகம் (Office)</option>
              <option value="Factory">தொழிற்சாலை (Factory)</option>
            </select>
          </div>
          <div class="form-group">
            <label>வீட்டு நுழைவாயில் திசை *</label>
            <select [(ngModel)]="vastuForm.main_door_direction" class="field">
              <option value="East">கிழக்கு (East)</option>
              <option value="West">மேற்கு (West)</option>
              <option value="North">வடக்கு (North)</option>
              <option value="South">தெற்கு (South)</option>
              <option value="North-East">வடகிழக்கு (North-East)</option>
              <option value="North-West">வடமேற்கு (North-West)</option>
              <option value="South-East">தென்கிழக்கு (South-East)</option>
              <option value="South-West">தென்மேற்கு (South-West)</option>
            </select>
          </div>
          <div class="form-group">
            <label>நிலத்தின் வடிவம்</label>
            <select [(ngModel)]="vastuForm.plot_shape" class="field">
              <option value="Square">சதுர வடிவம் (Square)</option>
              <option value="Rectangle">செவ்வக வடிவம் (Rectangle)</option>
              <option value="Irregular">ஒழுங்கற்ற வடிவம் (Irregular)</option>
            </select>
          </div>
          <div class="form-group">
            <label>குறிப்பிட்ட கேள்வி / பிரச்சனை</label>
            <textarea [(ngModel)]="vastuForm.query" placeholder="உங்கள் கேள்வி அல்லது பிரச்சனை..." rows="3" class="field textarea"></textarea>
          </div>

          <button class="book-btn" (click)="bookService('Vastu Consultation', 999, vastuForm)">
            📅 ₹999 செலுத்தி Appointment பதிவு செய்யுங்கள்
          </button>
        </div>
      }

      <!-- KANITHA (NUMEROLOGY) FORM -->
      @if (serviceType === 'kanitha') {
        <div class="form-card">
          <div class="service-intro">
            <h2>🔢 கணித ஜோதிடம்</h2>
            <p>உங்கள் பெயர் எண் மற்றும் பிறந்த தேதி எண் கணித்து, வாழ்க்கை பலன் அறியுங்கள்.</p>
            <div class="price-chip">₹749 / Reading</div>
          </div>

          <div class="form-group">
            <label>உங்கள் பெயர் *</label>
            <input [(ngModel)]="kanithaForm.name" placeholder="முழு பெயர்" class="field"/>
          </div>
          <div class="form-group">
            <label>தொடர்பு எண் *</label>
            <input type="tel" [(ngModel)]="kanithaForm.phone" placeholder="+91 99999 99999" class="field"/>
          </div>
          <div class="form-group">
            <label>பிறந்த தேதி *</label>
            <input type="date" [(ngModel)]="kanithaForm.dob" class="field"/>
          </div>
          <div class="form-group">
            <label>திருமண நிலை</label>
            <select [(ngModel)]="kanithaForm.marital_status" class="field">
              <option value="Single">திருமணமாகாத</option>
              <option value="Married">திருமணமான</option>
            </select>
          </div>
          <div class="form-group">
            <label>குறிப்பிட்ட கேள்வி</label>
            <textarea [(ngModel)]="kanithaForm.query" placeholder="உங்கள் கேள்வி..." rows="3" class="field textarea"></textarea>
          </div>

          <!-- Live Numerology Preview -->
          @if (kanithaForm.dob) {
            <div class="numerology-preview">
              <h4>உங்கள் முதன்மை எண்கள்</h4>
              <div class="num-row">
                <div class="num-box">
                  <span class="num-val">{{ getLifePathNumber() }}</span>
                  <span class="num-lbl">Life Path எண்</span>
                </div>
                <div class="num-box">
                  <span class="num-val">{{ getBirthdayNumber() }}</span>
                  <span class="num-lbl">Birthday எண்</span>
                </div>
              </div>
            </div>
          }

          <button class="book-btn kanitha" (click)="bookService('Kanitha Jothidam Reading', 749, kanithaForm)">
            📅 ₹749 செலுத்தி Numerology Reading பதிவு செய்யுங்கள்
          </button>
        </div>
      }

      <!-- Success State -->
      @if (booked) {
        <div class="success-card">
          <div class="success-icon">✅</div>
          <h2>Booking Confirmed!</h2>
          <p>Order ID: <strong>{{ bookedOrderId }}</strong></p>
          <p>உங்கள் appointment ஐ நாங்கள் உறுதிப்படுத்துவோம். 24 மணி நேரத்தில் தொடர்பு கொள்வோம்.</p>
          <button class="reset-btn" (click)="booked = false">புதிய Booking →</button>
        </div>
      }

      <!-- Loading Overlay -->
      @if (loading) {
        <div class="loading-overlay">
          <ion-spinner name="crescent" color="warning"></ion-spinner>
          <p>Payment & Booking processing...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .vk-wrapper { padding: 12px 14px 80px; position: relative; }

    .service-toggle { display: flex; gap: 10px; margin-bottom: 16px; }
    .service-toggle button { flex: 1; padding: 12px 8px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: #aaa; font-size: 12px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .service-toggle button.active { background: rgba(212,175,55,0.2); border-color: rgba(212,175,55,0.5); color: #ffd700; }

    .form-card { background: #160f33; border-radius: 16px; padding: 16px; border: 1px solid rgba(255,255,255,0.1); }
    .service-intro { margin-bottom: 16px; }
    .service-intro h2 { color: #ffd700; font-size: 18px; margin: 0 0 4px; }
    .service-intro p { color: #8a8ab0; font-size: 12px; margin: 0 0 10px; }
    .price-chip { display: inline-block; background: rgba(34,197,94,0.2); color: #4ade80; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }

    .form-group { margin-bottom: 12px; }
    label { font-size: 10px; color: #8a8ab0; display: block; margin-bottom: 4px; }
    .field { width: 100%; box-sizing: border-box; padding: 10px; background: #0a0618; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 13px; }
    .textarea { resize: vertical; font-family: inherit; }

    .book-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #d4af37, #aa7c11); border: none; border-radius: 12px; color: #000; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 14px; }
    .book-btn.kanitha { background: linear-gradient(135deg, #7c3aed, #4c1d95); color: #fff; }

    .numerology-preview { background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 14px; margin: 12px 0; }
    .numerology-preview h4 { color: #ffd700; font-size: 13px; margin: 0 0 10px; }
    .num-row { display: flex; gap: 10px; }
    .num-box { flex: 1; background: rgba(255,255,255,0.06); padding: 12px; border-radius: 10px; text-align: center; }
    .num-val { display: block; font-size: 32px; font-weight: 800; color: #ffd700; }
    .num-lbl { font-size: 10px; color: #8a8ab0; }

    .success-card { background: linear-gradient(135deg, #0d2a15, #0a1f10); border: 1px solid rgba(34,197,94,0.4); border-radius: 16px; padding: 24px; text-align: center; }
    .success-icon { font-size: 50px; margin-bottom: 12px; }
    .success-card h2 { color: #4ade80; margin: 0 0 8px; }
    .success-card p { color: #d0d0f0; font-size: 13px; line-height: 1.6; margin: 4px 0; }
    .reset-btn { margin-top: 16px; padding: 10px 20px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 10px; font-size: 13px; cursor: pointer; }

    .loading-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; border-radius: 16px; }
    .loading-overlay p { color: #ffd700; font-size: 14px; }
  `]
})
export class VastuKanithaComponent {
  serviceType: 'vastu' | 'kanitha' = 'vastu';
  loading = false;
  booked = false;
  bookedOrderId = '';

  vastuForm = { name: '', phone: '', property_type: 'Home', main_door_direction: 'East', plot_shape: 'Rectangle', query: '' };
  kanithaForm = { name: '', phone: '', dob: '', marital_status: 'Single', query: '' };

  constructor(private http: HttpClient) {}

  getLifePathNumber(): number {
    if (!this.kanithaForm.dob) return 0;
    const digits = this.kanithaForm.dob.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9) sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
    return sum;
  }

  getBirthdayNumber(): number {
    if (!this.kanithaForm.dob) return 0;
    const day = parseInt(this.kanithaForm.dob.split('-')[2]);
    let n = day;
    while (n > 9) n = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
    return n;
  }

  bookService(serviceType: string, price: number, formData: any) {
    if (!formData.name || !formData.phone) {
      alert('பெயர் மற்றும் தொடர்பு எண் கட்டாயம்.');
      return;
    }
    this.loading = true;

    const bookingPayload = {
      user_name: formData.name,
      user_phone: formData.phone,
      service_type: serviceType,
      price: price,
      details: { ...formData, service_category: this.serviceType }
    };

    this.http.post<any>('http://127.0.0.1:8000/api/bookings/create', bookingPayload).subscribe({
      next: res => {
        this.bookedOrderId = res.order_id;
        this.booked = true;
        this.loading = false;
      },
      error: () => { alert('பதிவு பிழை. மீண்டும் முயலவும்.'); this.loading = false; }
    });
  }
}
