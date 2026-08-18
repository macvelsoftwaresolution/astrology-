import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  matchStatusForm = { consultation_status: 'Pending', admin_notes: '' };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/marriage-matches', headers).subscribe({
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

  getMatchDetailsArray(details: any): any[] {
    if (Array.isArray(details)) return details;
    if (typeof details === 'object' && details !== null) {
      return Object.keys(details).map(k => ({ name: k, ...details[k] }));
    }
    return [];
  }

  openEditMatchStatus(match: any): void {
    this.editingMatch = match;
    this.matchStatusForm = {
      consultation_status: match.consultation_status || 'Pending',
      admin_notes: match.admin_notes || ''
    };
  }

  saveMatchStatus(): void {
    if (!this.editingMatch) return;
    const headers = this.authService.getAuthHeaders();
    this.http.put<any>(`http://127.0.0.1:8000/api/admin/marriage-matches/${this.editingMatch.id}`, this.matchStatusForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Match consultation status updated successfully!');
        this.editingMatch = null;
        this.loadMatches();
      },
      error: () => alert('Failed to update match status.')
    });
  }
}
