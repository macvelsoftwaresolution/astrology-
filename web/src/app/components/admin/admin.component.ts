import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Booking {
  id: string;
  user: string;
  phone: string;
  service: string;
  price: number;
  date: string;
  status: 'Pending' | 'Completed' | 'Refunded';
  details: any;
  chartUrl?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private apiUrl = 'http://localhost:8000/api';

  // Login Gate State
  isLoggedIn = false;
  username = '';
  password = '';
  loginError = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      try {
        const u = JSON.parse(userData);
        if (u && u.role === 'admin') {
          this.isLoggedIn = true;
        }
      } catch (e) {}
    }
    this.loadMetrics();
    this.loadBookings();
    this.loadPanchangam();
    this.loadRasiPalan();
  }

  loadRasiPalan() {
    this.http.get<any>(`${this.apiUrl}/rasi-palan`).subscribe({
      next: (data) => {
        if (data && Array.isArray(data.predictions)) {
          this.rasiPalanList = data.predictions.map((p: any) => ({
            rasi: p.rasi_name,
            star: '',
            prediction: p.prediction_text
          }));
        }
      },
      error: (err) => console.error('Failed to load rasi palan', err)
    });
  }

  loadMetrics() {
    this.http.get<any>(`${this.apiUrl}/admin/dashboard-metrics`).subscribe({
      next: (res) => {
        if (res && res.metrics) {
          this.totalUsers = res.metrics.total_students || 0;
          this.totalRevenue = res.metrics.total_revenue || 0;
        }
      },
      error: (err) => console.error('Failed to load metrics', err)
    });
  }

  loadBookings() {
    this.http.get<any[]>(`${this.apiUrl}/admin/bookings`).subscribe({
      next: (data) => {
        this.bookings = data.map(b => ({
          id: b.id,
          user: b.user_name,
          phone: b.user_phone,
          service: b.service_type,
          price: b.price,
          date: b.created_at ? b.created_at.substring(0, 10) : '',
          status: b.status,
          details: typeof b.details === 'string' ? JSON.parse(b.details) : b.details,
          chartUrl: b.chart_url
        }));
        this.totalRevenue = this.bookings.reduce((sum, b) => sum + Number(b.price), 0);
        this.totalBookingsCount = this.bookings.length;
        this.pendingHoroscopesCount = this.bookings.filter(b => b.status === 'Pending' && b.service === 'ஜாதகம் எழுதுதல்').length;
      },
      error: (err) => console.error('Failed to load bookings', err)
    });
  }

  loadPanchangam() {
    this.http.get<any>(`${this.apiUrl}/panchangam/today`).subscribe({
      next: (data) => {
        this.panchangam = {
          date: data.date,
          thithi: data.thithi,
          nakshathiram: data.star,
          rahukalam: data.rahukalam,
          yamagandam: data.yamagandam,
          nallaNeram: data.nalla_neram
        };
      },
      error: (err) => console.error('Failed to load panchangam', err)
    });
  }

  // Tab State
  activeTab: 'dashboard' | 'bookings' | 'horoscope-editor' | 'astrologers' = 'dashboard';

  // Analytics Metrics (Dynamic)
  totalRevenue = 0;
  totalBookingsCount = 0;
  pendingHoroscopesCount = 0;
  totalUsers = 0;

  // Bookings Data (Dynamic)
  bookings: Booking[] = [];

  // Daily Panchangam Details (Dynamic)
  panchangam = {
    date: '',
    thithi: '',
    nakshathiram: '',
    rahukalam: '',
    yamagandam: '',
    nallaNeram: ''
  };

  // Rasi Palan Predictions (Dynamic)
  rasiPalanList: { rasi: string; star: string; prediction: string }[] = [];

  // Astrologer Calendars Availability (Dynamic)
  astrologers: any[] = [];

  // Booking detail modal variables
  selectedBooking: Booking | null = null;
  uploadedFileName = '';

  login() {
    if (!this.username || !this.password) {
      this.loginError = 'தயவுசெய்து மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.';
      return;
    }

    this.loginError = '';
    this.http.post<any>(`${this.apiUrl}/auth/web-login`, {
      email: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        if (res.success && res.token) {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('user_data', JSON.stringify(res.user));
          this.isLoggedIn = true;
          this.loginError = '';
          this.loadBookings();
        } else {
          this.loginError = res.message || 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்!';
        }
      },
      error: (err) => {
        this.loginError = err.error?.message || 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்!';
      }
    });
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.isLoggedIn = false;
    this.username = '';
    this.password = '';
  }

  // Fulfill Booking Simulation
  viewBookingDetails(booking: Booking) {
    this.selectedBooking = booking;
    this.uploadedFileName = '';
  }

  closeModal() {
    this.selectedBooking = null;
  }

  fulfillBooking() {
    if (this.selectedBooking) {
      const payload = {
        chart_url: this.uploadedFileName || 'generated_horoscope_' + Date.now() + '.pdf'
      };
      this.http.put(`${this.apiUrl}/admin/bookings/${this.selectedBooking.id}/fulfill`, payload).subscribe({
        next: () => {
          this.loadBookings();
          this.closeModal();
        },
        error: (err) => alert('Fulfillment failed!')
      });
    }
  }

  // Edit Panchangam Handler
  savePanchangam() {
    const payload = {
      date: this.panchangam.date,
      thithi: this.panchangam.thithi,
      star: this.panchangam.nakshathiram,
      rahukalam: this.panchangam.rahukalam,
      yamagandam: this.panchangam.yamagandam,
      nalla_neram: this.panchangam.nallaNeram
    };
    this.http.put(`${this.apiUrl}/admin/panchangam`, payload).subscribe({
      next: () => alert('பஞ்சாங்கம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'),
      error: (err) => alert('பஞ்சாங்கம் புதுப்பிப்பதில் தோல்வி!')
    });
  }

  // Edit Rasi Palan Handler
  saveRasiPalan() {
    const payload = {
      date: this.panchangam.date,
      type: 'daily',
      predictions: this.rasiPalanList.map(r => ({
        rasi_name: r.rasi,
        prediction_text: r.prediction
      }))
    };
    this.http.put(`${this.apiUrl}/admin/rasi-palan`, payload).subscribe({
      next: () => alert('ராசி பலன் கணிப்புகள் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'),
      error: (err) => alert('ராசி பலன் புதுப்பிப்பதில் தோல்வி!')
    });
  }

  // Add Astrologer Slot
  addSlot(astrologerIndex: number) {
    const newTime = prompt('புதிய நேரத்தை உள்ளிடவும் (எ.கா., மாலை 06:00 - 07:00):');
    if (newTime) {
      this.astrologers[astrologerIndex].slots.push({
        time: newTime,
        status: 'Available'
      });
    }
  }

  // Toggle Astrologer Slot Status
  toggleSlot(astrologerIndex: number, slotIndex: number) {
    const slot = this.astrologers[astrologerIndex].slots[slotIndex];
    slot.status = slot.status === 'Available' ? 'Booked' : 'Available';
  }
}
