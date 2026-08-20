import { environment } from '../../../../../environments/environment';
import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

export interface Metrics {
  total_students: number;
  total_admins: number;
  total_courses: number;
  total_bookings: number;
  total_book_orders: number;
  total_revenue: number;
  ilanilai_applicants: number;
  muthunilai_applicants: number;
  revenue_breakdown: {
    courses: number;
    services: number;
    books: number;
  };
}

@Component({
  selector: 'app-overview-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './overview-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './overview-tab.component.css']
})
export class OverviewTabComponent implements OnInit {
  @Output() switchTab = new EventEmitter<string>();

  metrics: Metrics | null = null;
  teamList: any[] = [];
  banners: any[] = [];
  isLoading = false;

  editingBanner: any = null;
  showBannerModal = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadMetrics();
      this.loadTeamList();
      this.loadBanners();
    }
  }

  loadMetrics(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/dashboard-metrics`, headers).subscribe({
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
    this.http.get<any>(`${environment.apiUrl}/admin/team`, headers).subscribe({
      next: (res) => {
        this.teamList = res.admins || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadBanners(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/banners`, headers).subscribe({
      next: (res) => {
        this.banners = res.banners || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  openNewBanner(): void {
    this.editingBanner = {
      id: null,
      title: '',
      subtitle: '',
      badge: 'சிறப்பு',
      image_url: 'assets/images/temple_sunrise.png',
      link_flow: 'rasi-palan',
      is_active: true,
      sort_order: this.banners.length + 1
    };
    this.showBannerModal = true;
  }

  editBanner(banner: any): void {
    this.editingBanner = { ...banner };
    this.showBannerModal = true;
  }

  saveBanner(): void {
    if (!this.editingBanner.title) {
      alert('Banner title is required.');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    const url = this.editingBanner.id 
      ? `${environment.apiUrl}/admin/banners/${this.editingBanner.id}` 
      : `${environment.apiUrl}/admin/banners`;
    
    const req = this.editingBanner.id 
      ? this.http.put<any>(url, this.editingBanner, headers) 
      : this.http.post<any>(url, this.editingBanner, headers);

    req.subscribe({
      next: () => {
        this.showBannerModal = false;
        this.loadBanners();
      },
      error: () => alert('Failed to save banner.')
    });
  }

  isUploadingBannerImage = false;

  uploadBannerImage(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingBannerImage = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'banners');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.editingBanner) {
          this.editingBanner.image_url = res.url;
        }
        this.isUploadingBannerImage = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('File upload failed.');
        this.isUploadingBannerImage = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteBanner(id: number): void {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/banners/${id}`, headers).subscribe({
      next: () => this.loadBanners(),
      error: () => alert('Failed to delete banner.')
    });
  }

  goToTab(tabName: string): void {
    this.switchTab.emit(tabName);
  }
}
