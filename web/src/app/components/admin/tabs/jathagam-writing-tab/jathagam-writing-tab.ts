import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-jathagam-writing-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './jathagam-writing-tab.html',
  styleUrls: ['../../admin-dashboard.css', './jathagam-writing-tab.css']
})
export class JathagamWritingTabComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;

  selectedOrderForCourier: any = null;
  courierForm = {
    status: 'Shipped',
    courier_partner: 'ST Courier',
    awb_number: '',
    shipping_address: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/jathagam-writing-orders`, headers).subscribe({
      next: (res) => {
        this.orders = res.orders || [];
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      },
      error: (err) => {
        console.error('Error fetching jathagam writing orders', err);
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }

  parseDetails(detailsStr: string): any {
    if (!detailsStr) return {};
    try {
      return typeof detailsStr === 'object' ? detailsStr : JSON.parse(detailsStr);
    } catch {
      return {};
    }
  }

  openCourierModal(order: any): void {
    const details = this.parseDetails(order.details);
    const existingAddress = order.shipping_address || details.address || details.shipping_address || '';

    this.selectedOrderForCourier = order;
    this.courierForm = {
      status: order.status === 'Pending' ? 'Shipped' : (order.status || 'Shipped'),
      courier_partner: order.courier_partner || 'ST Courier',
      awb_number: order.awb_number || '',
      shipping_address: existingAddress
    };
    try { this.cdr.markForCheck(); } catch {}
  }

  saveCourierStatus(): void {
    if (!this.selectedOrderForCourier) return;

    const headers = this.authService.getAuthHeaders();
    const payload = {
      status: this.courierForm.status,
      courier_partner: this.courierForm.courier_partner,
      awb_number: this.courierForm.awb_number,
      shipping_address: this.courierForm.shipping_address
    };

    this.http.put<any>(`${environment.apiUrl}/admin/bookings/${this.selectedOrderForCourier.id}/courier`, payload, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Courier status updated successfully!', 'கூரியர் நிலை மாற்றப்பட்டது');
        this.selectedOrderForCourier = null;
        this.loadOrders();
      },
      error: () => {
        this.toastService.error('Failed to update courier status.', 'பிழை ஏற்பட்டது');
      }
    });
  }
}

