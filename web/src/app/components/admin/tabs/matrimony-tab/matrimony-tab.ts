import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

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
  
  @ViewChild('fileInput') fileInput!: ElementRef;
  uploadingProfileId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
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
        if (res && res.success) {
          this.profiles = res.profiles || [];
        } else if (Array.isArray(res)) {
          this.profiles = res;
        } else if (res && res.profiles) {
          this.profiles = res.profiles;
        } else {
          this.profiles = [];
        }
        this.loading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      },
      error: (err) => {
        console.error('Error fetching matrimony profiles', err);
        this.profiles = [];
        this.loading = false;
        try { this.cdr.markForCheck(); } catch {}
        try { this.cdr.detectChanges(); } catch {}
      }
    });
  }

  viewProfile(profile: any): void {
    this.viewingProfile = profile;
    this.isViewModalOpen = true;
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingProfile = null;
    this.cdr.detectChanges();
  }

  isImageUrl(value: any): boolean {
    if (typeof value !== 'string') return false;
    return value.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) != null || value.includes('cloudinary');
  }

  triggerUpload(profileId: number): void {
    this.uploadingProfileId = profileId;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.uploadingProfileId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'matrimony_documents');

    this.loading = true;
    this.cdr.detectChanges();
    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res.url) {
          this.saveResultDocument(this.uploadingProfileId!, res.url);
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toastService.error('File upload failed.');
      }
    });
  }

  saveResultDocument(profileId: number, url: string): void {
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/matrimony-profiles/${profileId}`, { result_document: url }, headers).subscribe({
      next: () => {
        this.toastService.success('Result document uploaded successfully!', 'ஆவணம் பதிவேற்றப்பட்டது');
        this.uploadingProfileId = null;
        this.loadProfiles();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toastService.error('Failed to save result document.', 'பிழை ஏற்பட்டது');
      }
    });
  }
}
