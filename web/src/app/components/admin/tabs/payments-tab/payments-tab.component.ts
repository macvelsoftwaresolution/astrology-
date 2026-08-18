import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-payments-tab',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './payments-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './payments-tab.component.css']
})
export class PaymentsTabComponent implements OnInit {
  paymentTransactions: any[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/payment-transactions', headers).subscribe({
      next: (res) => {
        this.paymentTransactions = res.payments || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
