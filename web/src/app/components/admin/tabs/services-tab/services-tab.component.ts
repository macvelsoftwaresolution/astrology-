import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
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
  fulfillForm = { status: 'Completed', chart_url: '', parigaram: '', parigaram_document: '' };
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
    private toastService: ToastService,
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
        this.serviceBookings = Array.isArray(res) ? res : (res?.bookings || []);
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
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
      chart_url: booking.chart_url || '',
      parigaram: booking.parigaram || '',
      parigaram_document: booking.parigaram_document || ''
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
        this.toastService.error('Chart upload failed.');
        this.isUploadingFulfillChart = false;
        this.cdr.detectChanges();
      }
    });
  }

  isUploadingFulfillParigaram: boolean = false;

  uploadFulfillParigaram(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingFulfillParigaram = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'parigarams');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.fulfillForm) {
          this.fulfillForm.parigaram_document = res.url;
        }
        this.isUploadingFulfillParigaram = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Parigaram document upload failed.');
        this.isUploadingFulfillParigaram = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadQuickParigaram(event: any, booking: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    booking.isUploadingParigaram = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'parigarams');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          const payload = {
            status: booking.status,
            chart_url: booking.chart_url,
            parigaram: booking.parigaram,
            parigaram_document: res.url
          };
          const headers = this.authService.getAuthHeaders();
          this.http.put<any>(`${environment.apiUrl}/admin/bookings/${booking.id}/fulfill`, payload, headers).subscribe({
            next: () => {
              booking.parigaram_document = res.url;
              booking.isUploadingParigaram = false;
              this.toastService.success('Parigaram document updated successfully.');
              this.cdr.detectChanges();
            },
            error: () => {
              booking.isUploadingParigaram = false;
              this.toastService.error('Failed to save Parigaram document to booking.');
              this.cdr.detectChanges();
            }
          });
        }
      },
      error: () => {
        booking.isUploadingParigaram = false;
        this.toastService.error('Parigaram document upload failed.');
        this.cdr.detectChanges();
      }
    });
  }

  submitFulfill(): void {
    if (!this.selectedBookingForFulfill) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/bookings/${this.selectedBookingForFulfill.id}/fulfill`, this.fulfillForm, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Booking status updated successfully!', 'ஆலோசனை நிலை புதுப்பிக்கப்பட்டது');
        this.selectedBookingForFulfill = null;
        this.loadBookings();
      },
      error: () => this.toastService.error('Failed to update booking status.', 'பிழை ஏற்பட்டது')
    });
  }

  deleteBooking(id: any): void {
    if (!confirm(`Are you sure you want to delete booking #${id}?`)) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/bookings/${id}`, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Booking deleted successfully!', 'பதிவு நீக்கப்பட்டது');
        this.loadBookings();
      },
      error: () => this.toastService.error('Failed to delete booking.', 'பிழை ஏற்பட்டது')
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
      this.toastService.error('Client name and phone are required.', 'விவரங்கள் தேவை');
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
        this.toastService.success(`Booking #${res.order_id || 'AST'} created successfully!`, 'பதிவு உருவாக்கப்பட்டது');
        this.manualBookingModalOpen = false;
        this.loadBookings();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to create booking.', 'பிழை ஏற்பட்டது');
      }
    });
  }
}
