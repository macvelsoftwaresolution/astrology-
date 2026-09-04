import { environment } from '../../../../../environments/environment';
import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

export interface Metrics {
  total_members?: number;
  total_students: number;
  total_admins: number;
  total_courses: number;
  total_bookings: number;
  total_book_orders: number;
  total_matches?: number;
  total_matrimony_profiles?: number;
  total_revenue: number;
  ilanilai_applicants: number;
  muthunilai_applicants: number;
  revenue_breakdown: {
    courses: number;
    services: number;
    matches: number;
    matrimony: number;
    books: number;
  };
}

@Component({
  selector: 'app-overview-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './overview-tab.html',
  styleUrls: ['../../admin-dashboard.css', './overview-tab.css']
})
export class OverviewTabComponent implements OnInit {
  @Output() switchTab = new EventEmitter<string>();

  metrics: Metrics | null = null;
  teamList: any[] = [];
  banners: any[] = [];
  recentMembers: any[] = [];
  isLoading = false;

  editingBanner: any = { title: '', image_url: '', target_route: '', is_active: 1, sort_order: 0 };
  showBannerModal = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.loadMetrics();
        this.loadTeamList();
        this.loadBanners();
      }, 0);
    }
  }

  loadMetrics(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/dashboard-metrics?_t=${Date.now()}`, headers).subscribe({
      next: (res) => {
        if (res && res.metrics) {
          this.metrics = res.metrics;
        }
        if (res && res.recent_members) {
          this.recentMembers = res.recent_members;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
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

  openUsersDirectory(): void {
    this.switchTab.emit('users');
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
      this.toastService.error('Banner title is required.', 'விவரங்கள் தேவை');
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
        this.toastService.success('Hero banner saved successfully!', 'பேனர் சேமிக்கப்பட்டது');
        this.showBannerModal = false;
        this.loadBanners();
      },
      error: () => this.toastService.error('Failed to save banner.', 'பிழை ஏற்பட்டது')
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
        this.toastService.success('Banner image uploaded successfully.');
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('File upload failed.');
        this.isUploadingBannerImage = false;
        this.cdr.detectChanges();
      }
    });
  }

  async deleteBanner(id: number): Promise<void> {
    const ok = await this.confirmService.confirm({
      title: 'பேனரை நீக்கவா?',
      message: 'இந்த முகப்பு பேனர் விளம்பரம் நிரந்தரமாக நீக்கப்படும். நிச்சயமாக நீக்க வேண்டுமா?',
      confirmText: 'ஆம், நீக்குக',
      type: 'danger',
      icon: 'bi bi-trash3-fill'
    });
    if (!ok) return;

    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/banners/${id}`, headers).subscribe({
      next: () => {
        this.toastService.success('Hero banner deleted successfully.', 'பேனர் நீக்கப்பட்டது');
        this.loadBanners();
      },
      error: () => this.toastService.error('Failed to delete banner.', 'பிழை ஏற்பட்டது')
    });
  }

  goToTab(tabName: string): void {
    this.switchTab.emit(tabName);
  }
}
