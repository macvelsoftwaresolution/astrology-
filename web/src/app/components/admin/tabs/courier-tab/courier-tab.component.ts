import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-courier-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courier-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './courier-tab.component.css']
})
export class CourierTabComponent implements OnInit {
  bookOrders: any[] = [];
  isLoading = false;
  selectedOrderForCourier: any = null;
  courierForm = { status: 'Shipped', courier_partner: 'Blue Dart', awb_number: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/book-orders', headers).subscribe({
      next: (res) => {
        this.bookOrders = res.orders || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCourierModal(order: any): void {
    this.selectedOrderForCourier = order;
    this.courierForm = {
      status: order.status || 'Shipped',
      courier_partner: order.courier_partner || 'Blue Dart',
      awb_number: order.awb_number || ''
    };
  }

  saveCourierStatus(): void {
    if (!this.selectedOrderForCourier) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`http://127.0.0.1:8000/api/admin/book-orders/${this.selectedOrderForCourier.id}/courier`, this.courierForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Courier status updated successfully!');
        this.selectedOrderForCourier = null;
        this.loadOrders();
      },
      error: () => alert('Failed to update courier status.')
    });
  }
}
