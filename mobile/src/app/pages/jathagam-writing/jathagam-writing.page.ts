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
    address: '',
    notes: ''
  };

  price = 501; // Fixed price for Jathagam Writing
  isProcessingPayment = false;
  validationError = '';
  bookingRefCode = '';
  isSuccess = false;

  tobDisplay = '';
  tobAmPm = 'AM';

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.form.name = user.name || '';
      this.form.phone = user.phone || '';
      this.form.address = user.address || '';
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
      this.validationError = 'errors.enterValidName';
      return;
    }
    const cleanPhone = (this.form.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      this.validationError = 'errors.enterPhone';
      return;
    }
    if (!this.form.dob || !this.form.tob || !this.form.pob) {
      this.validationError = 'errors.enterDob';
      return;
    }
    if (!this.form.address || this.form.address.trim().length < 5) {
      this.validationError = 'ஜாதகம் கூரியரில் அனுப்ப உங்கள் முழு முகவரியை (Door No, Street, Pincode) உள்ளிடவும்!';
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
            description: 'ஜாதகம் எழுதுதல் (Test Mode)',
            order_id: orderRes.order_id,
            prefill: {
              name: this.form.name,
              contact: this.form.phone || '9876543210'
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
            rzp.on('payment.failed', (response: any) => {
              this.isProcessingPayment = false;
              alert('Payment Failed: ' + (response.error?.description || 'தோல்வியடைந்தது'));
            });
            rzp.open();
          } catch (e) {
            console.error('Razorpay initialization failed', e);
            this.isProcessingPayment = false;
            alert('Could not initialize payment gateway.');
          }
        } else {
          this.isProcessingPayment = false;
          alert('கட்டணம் செலுத்துவதற்கான ஆர்டரை உருவாக்குவதில் பிழை ஏற்பட்டது.');
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
      shipping_address: this.form.address,
      price: this.price,
      details: {
        dob: this.form.dob,
        tob: this.form.tob,
        pob: this.form.pob,
        gender: this.form.gender,
        address: this.form.address,
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

  formatTobDisplay(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length >= 3) {
      formatted = val.slice(0, 2) + ':' + val.slice(2, 4);
    }
    this.tobDisplay = formatted;
    event.target.value = formatted;
    this.updateTobBackend();
  }

  updateTobBackend() {
    if (this.tobDisplay && this.tobDisplay.replace(/\D/g, '').length === 4) {
      let val = this.tobDisplay.replace(/\D/g, '');
      let h = parseInt(val.slice(0, 2) || '0', 10);
      let mStr = val.slice(2, 4);
      if (this.tobAmPm === 'PM' && h < 12) h += 12;
      if (this.tobAmPm === 'AM' && h === 12) h = 0;
      this.form.tob = `${h.toString().padStart(2, '0')}:${mStr}:00`;
    } else {
      this.form.tob = '';
    }
  }
}

