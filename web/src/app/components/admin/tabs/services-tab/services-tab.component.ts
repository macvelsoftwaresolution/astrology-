import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-services-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './services-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './services-tab.component.css']
})
export class ServicesTabComponent implements OnInit {
  serviceBookings: any[] = [];
  bookingFilterStatus = 'all';
  bookingSearchQuery = '';

  selectedBookingForView: any = null;
  selectedBookingForFulfill: any = null;
  fulfillForm = { status: 'Completed', chart_url: '' };
  isUploadingFulfillChart = false;

  manualBookingModalOpen = false;
  manualBookingForm = {
    user_name: '',
    user_phone: '',
    service_type: 'Full Jathagam Reading & Porutham Matching',
    price: 499,
    booking_date: '',
    dob: '',
    tob: '',
    pob: '',
    query: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadBookings();
    }
  }

  loadBookings(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/bookings`, headers).subscribe({
      next: (res) => {
        this.serviceBookings = res || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getBookingCount(status: string): number {
    return this.serviceBookings.filter(b => b.status === status).length;
  }

  getFilteredBookings(): any[] {
    let list = this.serviceBookings;
    if (this.bookingFilterStatus !== 'all') {
      list = list.filter(b => b.status === this.bookingFilterStatus);
    }
    if (this.bookingSearchQuery && this.bookingSearchQuery.trim()) {
      const q = this.bookingSearchQuery.toLowerCase().trim();
      list = list.filter(b =>
        (b.user_name && b.user_name.toLowerCase().includes(q)) ||
        (b.user_phone && b.user_phone.toLowerCase().includes(q)) ||
        (b.service_type && b.service_type.toLowerCase().includes(q)) ||
        (String(b.id).toLowerCase().includes(q)) ||
        (b.details?.query && b.details.query.toLowerCase().includes(q)) ||
        (b.details?.preferred_date && b.details.preferred_date.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getTotalBookingRevenue(): number {
    return this.serviceBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  }

  openViewBookingModal(booking: any): void {
    this.selectedBookingForView = booking;
  }

  openFulfillModal(booking: any): void {
    this.selectedBookingForFulfill = booking;
    this.fulfillForm = {
      status: booking.status || 'Completed',
      chart_url: booking.chart_url || ''
    };
  }

  uploadFulfillChart(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingFulfillChart = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'charts');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.fulfillForm) {
          this.fulfillForm.chart_url = res.url;
        }
        this.isUploadingFulfillChart = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Chart upload failed.');
        this.isUploadingFulfillChart = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitFulfill(): void {
    if (!this.selectedBookingForFulfill) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/bookings/${this.selectedBookingForFulfill.id}/fulfill`, this.fulfillForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Booking status updated successfully!');
        this.selectedBookingForFulfill = null;
        this.loadBookings();
      },
      error: () => alert('❌ Failed to update booking status.')
    });
  }

  deleteBooking(id: any): void {
    if (!confirm(`Are you sure you want to delete booking #${id}?`)) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/bookings/${id}`, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Booking deleted successfully!');
        this.loadBookings();
      },
      error: () => alert('❌ Failed to delete booking.')
    });
  }

  openManualBookingModal(): void {
    this.manualBookingForm = {
      user_name: '',
      user_phone: '',
      service_type: 'Full Jathagam Reading & Porutham Matching',
      price: 499,
      booking_date: new Date().toISOString().split('T')[0],
      dob: '',
      tob: '',
      pob: '',
      query: ''
    };
    this.manualBookingModalOpen = true;
  }

  submitManualBooking(): void {
    if (!this.manualBookingForm.user_name || !this.manualBookingForm.user_phone) {
      alert('Client name and phone are required.');
      return;
    }

    const payload = {
      user_name: this.manualBookingForm.user_name,
      user_phone: this.manualBookingForm.user_phone,
      service_type: this.manualBookingForm.service_type,
      price: this.manualBookingForm.price,
      booking_date: this.manualBookingForm.booking_date,
      details: {
        dob: this.manualBookingForm.dob,
        tob: this.manualBookingForm.tob,
        pob: this.manualBookingForm.pob,
        query: this.manualBookingForm.query,
        preferred_date: this.manualBookingForm.booking_date
      }
    };

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/bookings/create`, payload, headers).subscribe({
      next: (res) => {
        alert(`Booking #${res.order_id || 'AST'} created successfully!`);
        this.manualBookingModalOpen = false;
        this.loadBookings();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create booking.');
      }
    });
  }
}
