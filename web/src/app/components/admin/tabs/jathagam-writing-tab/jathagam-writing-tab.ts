import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-jathagam-writing-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jathagam-writing-tab.html',
  styleUrls: ['../../admin-dashboard.component.css', './jathagam-writing-tab.css']
})
export class JathagamWritingTabComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
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
      },
      error: (err) => {
        console.error('Error fetching jathagam writing orders', err);
        this.isLoading = false;
        try { this.cdr.markForCheck(); } catch {}
      }
    });
  }

  parseDetails(detailsStr: string): any {
    if (!detailsStr) return {};
    try {
      return JSON.parse(detailsStr);
    } catch {
      return {};
    }
  }
}
