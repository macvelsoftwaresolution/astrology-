import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare var Razorpay: any;

@Component({
  selector: 'app-jathagam-writing',
  templateUrl: './jathagam-writing.page.html',
  styleUrls: ['./jathagam-writing.page.scss'],
  standalone: false
})
export class JathagamWritingPage implements OnInit {
  form = {
    name: '',
    phone: '',
    dob: '',
    tob: '',
    pob: '',
    gender: 'Male',
    notes: ''
  };

  price = 501; // Fixed price for Jathagam Writing
  isProcessingPayment = false;
  validationError = '';
  bookingRefCode = '';
  isSuccess = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.form.name = user.name || '';
      this.form.phone = user.phone || '';
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToTab(tabName: string) {
    // In Ionic, navigating to a route like /home with state or query params can trigger tab change if home page reads it.
    // For now, we will navigate back to home. The user can then click the tab if needed, or we can add a simple query param.
    this.router.navigate(['/home'], { queryParams: { tab: tabName } });
  }

  payAndSubmit() {
    this.validationError = '';

    if (!this.form.name || this.form.name.trim().length < 2) {
      this.validationError = 'தயவுசெய்து உங்கள் பெயரைச் சரியாக உள்ளிடவும்!';
      return;
    }
    const cleanPhone = (this.form.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      this.validationError = 'தயவுசெய்து சரியான 10 இலக்க அலைபேசி எண்ணை உள்ளிடவும்!';
      return;
    }
    if (!this.form.dob || !this.form.tob || !this.form.pob) {
      this.validationError = 'பிறந்த தேதி, நேரம் மற்றும் ஊர் விவரங்களை முழுமையாக நிரப்பவும்!';
      return;
    }

    this.isProcessingPayment = true;

    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    this.http.post<any>(`${environment.apiUrl}/payments/create-order`, { amount: this.price }, { headers }).subscribe({
      next: (orderRes) => {
        if (orderRes && orderRes.success && typeof Razorpay !== 'undefined' && orderRes.key_id) {
          const options = {
            key: orderRes.key_id,
            amount: this.price * 100,
            currency: 'INR',
            name: 'ஆருத்ரா ஜோதிடம்',
            description: 'ஜாதகம் எழுதுதல் (Jathagam Writing)',
            order_id: orderRes.order_id,
            prefill: {
              name: this.form.name,
              contact: this.form.phone
            },
            theme: { color: '#4A0E17' },
            handler: (response: any) => {
              this.completeBooking(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            },
            modal: {
              ondismiss: () => {
                this.isProcessingPayment = false;
              }
            }
          };

          try {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
              this.isProcessingPayment = false;
              alert('கட்டணம் செலுத்துவதில் பிழை: ' + (resp.error?.description || 'தோல்வியடைந்தது'));
            });
            rzp.open();
          } catch (e: any) {
            this.isProcessingPayment = false;
            alert('Razorpay popup பிழை: ' + (e?.message || e));
          }
        } else {
          this.isProcessingPayment = false;
          alert('Razorpay ஆர்டர் உருவாக்குவதில் பிழை.');
        }
      },
      error: (err) => {
        this.isProcessingPayment = false;
        alert('Payment initialization failed.');
      }
    });
  }

  completeBooking(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const payload = {
      user_name: this.form.name,
      user_phone: this.form.phone,
      price: this.price,
      details: {
        dob: this.form.dob,
        tob: this.form.tob,
        pob: this.form.pob,
        gender: this.form.gender,
        notes: this.form.notes,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId
      },
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId
    };

    this.http.post<any>(`${environment.apiUrl}/jathagam-writing/order`, payload, { headers }).subscribe({
      next: (res) => {
        this.isProcessingPayment = false;
        if (res && res.success) {
          this.bookingRefCode = res.booking_id;
          this.isSuccess = true;
        } else {
          alert('Failed to save order.');
        }
      },
      error: () => {
        this.isProcessingPayment = false;
        alert('Error saving order.');
      }
    });
  }
}

