import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-matrimony-tab',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './matrimony-tab.html',
  styleUrls: ['../../admin-dashboard.component.css', './matrimony-tab.css']
})
export class MatrimonyTab implements OnInit {
  profiles: any[] = [];
  loading: boolean = true;

  // View Modal State
  isViewModalOpen: boolean = false;
  viewingProfile: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadProfiles();
    }
  }

  loadProfiles(): void {
    if (typeof window === 'undefined') return;
    this.loading = true;
    const headers = this.authService.getAuthHeaders();
    
    this.http.get<any>(`${environment.apiUrl}/admin/matrimony-profiles`, headers).subscribe({
      next: (res) => {
        if (res.success) {
          this.profiles = res.profiles || [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching matrimony profiles', err);
        this.loading = false;
      }
    });
  }

  viewProfile(profile: any): void {
    this.viewingProfile = profile;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingProfile = null;
  }

  isImageUrl(value: any): boolean {
    if (typeof value !== 'string') return false;
    return value.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) != null || value.includes('cloudinary');
  }
}
