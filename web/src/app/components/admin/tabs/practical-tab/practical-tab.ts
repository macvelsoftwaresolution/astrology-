import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { ToastService } from '../../../../services/toast.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-practical-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './practical-tab.html',
  styleUrls: ['../../admin-dashboard.css', '../exams-eval-tab/exams-eval-tab.css']
})
export class PracticalTabComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  public translationService = inject(TranslationService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  selectedCategory = 'ILANILAI';
  exams: any[] = [];
  
  isEditing = false;
  activeExamWizard: any = null;

  isUploadingChart = false;

  constructor() {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadExams();
    }
  }

  loadExams(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/public/exams/${this.selectedCategory}`, headers).subscribe({
      next: (res) => {
        // Only show practical exams
        this.exams = (res.exams || []).filter((e: any) => e.is_practical == 1 || e.is_practical === true);
        this.cdr?.markForCheck();
      },
      error: () => {}
    });
  }

  onCategoryChange(): void {
    this.cancelEdit();
    this.loadExams();
  }

  createNewPractical(): void {
    this.isEditing = true;
    this.activeExamWizard = {
      title: '',
      level: this.selectedCategory,
      exam_date: '',
      duration: 60,
      total_marks: 100,
      pass_mark: 40,
      practical_prompt: '',
      chart_image_url: '',
      is_practical: true
    };
  }

  editPractical(exam: any): void {
    this.isEditing = true;
    // Format date for datetime-local input if it exists
    let formattedDate = exam.exam_date;
    if (formattedDate && !formattedDate.includes('T')) {
      // rough conversion if it's purely yyyy-mm-dd hh:mm:ss
      formattedDate = formattedDate.replace(' ', 'T').substring(0, 16);
    }
    
    this.activeExamWizard = { ...exam, exam_date: formattedDate };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.activeExamWizard = null;
  }

  onChartImageFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploadingChart = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'exam_charts');

    const headers = this.authService.getUploadHeaders();
    this.http.post<any>(`${environment.apiUrl}/upload`, formData, headers).subscribe({
      next: (res) => {
        this.isUploadingChart = false;
        if (res && res.url) {
          this.activeExamWizard.chart_image_url = res.url;
        } else if (res && res.path) {
          this.activeExamWizard.chart_image_url = res.path;
        }
        this.cdr?.markForCheck();
      },
      error: () => {
        this.isUploadingChart = false;
        this.toastService.error('படம் பதிவேற்றுவதில் பிழை ஏற்பட்டது.');
        this.cdr?.markForCheck();
      }
    });
  }

  removeUploadedChart(): void {
    if (this.activeExamWizard) {
      this.activeExamWizard.chart_image_url = '';
      this.cdr?.markForCheck();
    }
  }

  savePracticalExam(): void {
    if (!this.activeExamWizard || !this.activeExamWizard.title) {
      this.toastService.error('தலைப்பு அவசியம் (Title is required)');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    const isNew = !this.activeExamWizard.id;
    const url = isNew 
      ? `${environment.apiUrl}/admin/exams` 
      : `${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}`;
    
    const method = isNew ? 'post' : 'put';

    // Ensure it's marked as practical
    this.activeExamWizard.is_practical = true;
    this.activeExamWizard.level = this.selectedCategory;

    // Convert datetime-local to standard format if needed
    let finalDate = this.activeExamWizard.exam_date;
    if (finalDate && finalDate.includes('T')) {
      finalDate = finalDate.replace('T', ' ') + ':00';
    }

    const payload = {
      ...this.activeExamWizard,
      exam_date: finalDate
    };

    const options = this.authService.getAuthHeaders();

    this.http.request<any>(method, url, { body: payload, ...options }).subscribe({
      next: (res: any) => {
        this.toastService.success(res?.message || 'Practical exam saved successfully!');
        this.cancelEdit();
        this.loadExams();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Error saving practical exam.')
    });
  }
  
  deletePractical(examId: number): void {
    if (confirm('Are you sure you want to delete this practical exam?')) {
      const options = this.authService.getAuthHeaders();
      this.http.delete<any>(`${environment.apiUrl}/admin/exams/${examId}`, options).subscribe({
        next: (res: any) => {
          this.toastService.success('Deleted successfully.');
          this.loadExams();
        },
        error: (err) => this.toastService.error('Error deleting exam.')
      });
    }
  }
}
