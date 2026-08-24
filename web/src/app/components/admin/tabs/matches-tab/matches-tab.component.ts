import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-matches-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './matches-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './matches-tab.component.css']
})
export class MatchesTabComponent implements OnInit {
  marriageMatches: any[] = [];
  isLoading = false;
  selectedMatch: any = null;
  editingMatch: any = null;
  matchStatusForm: any = { admin_status: 'Pending', consultation_status: 'Pending', admin_notes: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadMatches();
    }
  }

  loadMatches(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/marriage-matches`, headers).subscribe({
      next: (res) => {
        this.marriageMatches = (res.matches || []).map((m: any) => ({
          ...m,
          match_details: typeof m.match_details === 'string' ? JSON.parse(m.match_details) : (m.match_details || [])
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openEditMatchStatus(match: any): void {
    this.editingMatch = match;
    const status = match.admin_status || match.consultation_status || 'Pending';
    this.matchStatusForm = {
      admin_status: status,
      consultation_status: status,
      admin_notes: match.admin_notes || ''
    };
  }

  saveMatchStatus(): void {
    if (!this.editingMatch) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/marriage-matches/${this.editingMatch.id}`, this.matchStatusForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Match consultation status updated successfully!');
        this.editingMatch = null;
        this.loadMatches();
      },
      error: () => alert('Failed to update match status.')
    });
  }

  @ViewChild('fileInput') fileInput!: ElementRef;
  uploadingMatchId: number | null = null;

  triggerUpload(matchId: number): void {
    this.uploadingMatchId = matchId;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.uploadingMatchId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'marriage_documents');

    this.isLoading = true;
    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res.url) {
          this.saveResultDocument(this.uploadingMatchId!, res.url);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
        alert('File upload failed.');
      }
    });
  }

  saveResultDocument(matchId: number, url: string): void {
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`${environment.apiUrl}/admin/marriage-matches/${matchId}`, { result_document: url }, headers).subscribe({
      next: () => {
        alert('Result document uploaded successfully!');
        this.uploadingMatchId = null;
        this.loadMatches();
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to save result document.');
      }
    });
  }
}
