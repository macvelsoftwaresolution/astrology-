import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-grading-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './grading-tab.component.html',
  styleUrls: ['../../admin-dashboard.component.css', './grading-tab.component.css']
})
export class GradingTabComponent implements OnInit {
  submissions: any[] = [];
  isLoading = false;
  selectedSubmissionForGrading: any = null;
  gradingForm = { score: 85, status: 'Approved', evaluator_notes: 'Great work.' };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadSubmissions();
    }
  }

  loadSubmissions(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>('http://127.0.0.1:8000/api/admin/submissions', headers).subscribe({
      next: (res) => {
        this.submissions = res.submissions || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openGradingModal(sub: any): void {
    this.selectedSubmissionForGrading = sub;
    this.gradingForm = {
      score: sub.score !== null && sub.score !== undefined ? sub.score : 85,
      status: sub.status === 'Approved' ? 'Approved' : 'Approved',
      evaluator_notes: sub.evaluator_notes || 'Excellent grasp of Vedic astrology concepts.'
    };
  }

  saveGrading(): void {
    if (!this.selectedSubmissionForGrading) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`http://127.0.0.1:8000/api/admin/submissions/${this.selectedSubmissionForGrading.id}/evaluate`, this.gradingForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Exam evaluated and certificate issued successfully!');
        this.selectedSubmissionForGrading = null;
        this.loadSubmissions();
      },
      error: () => alert('Failed to evaluate exam.')
    });
  }
}
