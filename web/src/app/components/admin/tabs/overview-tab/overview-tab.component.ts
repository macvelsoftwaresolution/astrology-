import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';

export interface Metrics {
  total_students: number;
  total_admins: number;
  total_courses: number;
  total_bookings: number;
  total_book_orders: number;
  total_revenue: number;
  revenue_breakdown: {
    courses: number;
    services: number;
    books: number;
  };
}

import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-overview-tab',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './overview-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './overview-tab.component.css']
})
export class OverviewTabComponent implements OnInit {
  @Output() switchTab = new EventEmitter<string>();

  metrics: Metrics | null = null;
  teamList: any[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadMetrics();
      this.loadTeamList();
    }
  }

  loadMetrics(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/dashboard-metrics', headers).subscribe({
      next: (res) => {
        this.metrics = res.metrics;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTeamList(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/team', headers).subscribe({
      next: (res) => {
        this.teamList = res.admins || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  goToTab(tabName: string): void {
    this.switchTab.emit(tabName);
  }
}
