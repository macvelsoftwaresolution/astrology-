import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-exams-eval-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './exams-eval-tab.html',
  styleUrls: ['../../admin-dashboard.css', './exams-eval-tab.css']
})
export class ExamsEvalTabComponent implements OnInit {
  activeView: 'list' | 'exam-wizard' | 'evaluation' = 'list';
  selectedCategory = 'ILANILAI';
  
  exams: any[] = [];
  batches: any[] = [];
  selectedBatchId: any = '';

  // Exam Wizard State
  activeExamWizard: any = null;
  newQuestion = {
    type: 'mcq',
    question_text: '',
    optionsStr: 'Option A, Option B, Option C, Option D',
    correct_answer: 'Option A',
    marks: 1
  };
  csvFileToUpload: File | null = null;
  chartImageToUpload: File | null = null;
  isUploadingChart = false;

  // Evaluation Submissions State
  submissions: any[] = [];
  isLoadingSubmissions = false;
  selectedSubmissionForGrading: any = null;
  gradingForm = {
    mcq_score: 40,
    practical_score: 45,
    score: 85,
    status: 'Approved',
    evaluator_notes: 'சிறப்பான ஜாதகக் கணிப்பு. தேர்ச்சி பெற்றார்.',
    is_published: true
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadExams();
      this.loadBatches();
      this.loadSubmissions();
    }
  }

  loadExams(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/public/exams/${this.selectedCategory}`, headers).subscribe({
      next: (res) => {
        this.exams = res.exams || [];
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadBatches(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/lms/batches`, headers).subscribe({
      next: (res) => {
        this.batches = res.batches || res || [];
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadSubmissions(): void {
    this.isLoadingSubmissions = true;
    const headers = this.authService.getAuthHeaders();
    let url = `${environment.apiUrl}/admin/submissions`;
    if (this.selectedBatchId) {
      url += `?batch_id=${this.selectedBatchId}`;
    }
    this.http.get<any>(url, headers).subscribe({
      next: (res) => {
        this.submissions = res.submissions || [];
        this.isLoadingSubmissions = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingSubmissions = false;
        this.cdr.markForCheck();
      }
    });
  }

  // --- EXAM WIZARD ACTIONS ---
  openCreateExam(): void {
    this.activeExamWizard = {
      id: null,
      level: this.selectedCategory,
      title: '',
      duration: 60,
      total_marks: 100,
      pass_mark: 40,
      practical_prompt: 'கீழே கொடுக்கப்பட்டுள்ள ஜாதகக் கட்டத்தைப் பார்த்து லக்னம், ராசி மற்றும் கிரக நிலைகளைக் கணித்து பலன் எழுதுக.',
      chart_image_url: '',
      batch_id: this.selectedBatchId || null,
      questions: []
    };
    this.activeView = 'exam-wizard';
  }

  editExam(exam: any): void {
    this.activeExamWizard = { ...exam };
    if (!this.activeExamWizard.questions) this.activeExamWizard.questions = [];
    this.activeView = 'exam-wizard';
  }

  saveExam(): void {
    if (!this.activeExamWizard.title) {
      alert('தயவுசெய்து தேர்வின் தலைப்பை உள்ளிடவும்.');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    const isEdit = !!this.activeExamWizard.id;
    const url = isEdit
      ? `${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}`
      : `${environment.apiUrl}/admin/exams`;
    
    const request$ = isEdit
      ? this.http.put<any>(url, this.activeExamWizard, headers)
      : this.http.post<any>(url, this.activeExamWizard, headers);

    request$.subscribe({
      next: (res: any) => {
        alert(res?.message || 'தேர்வு வெற்றிகரமாக சேமிக்கப்பட்டது!');
        if (!isEdit && res?.exam_id) {
          this.activeExamWizard.id = res.exam_id;
        }
        this.loadExams();
      },
      error: () => alert('தேர்வை சேமிப்பதில் பிழை ஏற்பட்டது.')
    });
  }

  deleteExam(id: number): void {
    if (!confirm('இந்த தேர்வை நீக்க விரும்புகிறீர்களா?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/exams/${id}`, headers).subscribe({
      next: () => {
        this.loadExams();
        if (this.activeView === 'exam-wizard') this.activeView = 'list';
      },
      error: () => alert('தேர்வை நீக்குவதில் பிழை ஏற்பட்டது.')
    });
  }

  onChartImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploadingChart = true;
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/upload`, formData, headers).subscribe({
      next: (res) => {
        this.isUploadingChart = false;
        if (res.url && this.activeExamWizard) {
          this.activeExamWizard.chart_image_url = res.url;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isUploadingChart = false;
        alert('படம் பதிவேற்றுவதில் பிழை ஏற்பட்டது.');
        this.cdr.markForCheck();
      }
    });
  }

  async ensureExamSaved(): Promise<boolean> {
    if (this.activeExamWizard.id) return true;
    if (!this.activeExamWizard.title) {
      alert('தயவுசெய்து தேர்வின் தலைப்பை (Title) உள்ளிடவும்.');
      return false;
    }
    const headers = this.authService.getAuthHeaders();
    try {
      const res: any = await this.http.post<any>(`${environment.apiUrl}/admin/exams`, this.activeExamWizard, headers).toPromise();
      if (res && res.exam_id) {
        this.activeExamWizard.id = res.exam_id;
        this.loadExams();
        return true;
      }
    } catch (e) {
      alert('தேர்வை சேமிப்பதில் பிழை ஏற்பட்டது.');
      return false;
    }
    return false;
  }

  async addQuestion(): Promise<void> {
    if (!this.newQuestion.question_text) {
      alert('தயவுசெய்து வினாவின் கேள்வியை உள்ளிடவும்.');
      return;
    }
    const saved = await this.ensureExamSaved();
    if (!saved || !this.activeExamWizard.id) return;

    const headers = this.authService.getAuthHeaders();
    const optionsArray = this.newQuestion.optionsStr.split(',').map(s => s.trim());
    const payload = {
      type: this.newQuestion.type,
      question_text: this.newQuestion.question_text,
      options: optionsArray,
      correct_answer: this.newQuestion.correct_answer,
      marks: this.newQuestion.marks
    };
    this.http.post<any>(`${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}/questions`, payload, headers).subscribe({
      next: (res) => {
        if (!this.activeExamWizard.questions) this.activeExamWizard.questions = [];
        this.activeExamWizard.questions.push({ ...payload, id: res.question_id });
        this.newQuestion.question_text = '';
        this.cdr.markForCheck();
      },
      error: () => alert('வினாவை சேர்ப்பதில் பிழை.')
    });
  }

  deleteQuestion(id: number, idx: number): void {
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/questions/${id}`, headers).subscribe({
      next: () => {
        this.activeExamWizard.questions.splice(idx, 1);
        this.cdr.markForCheck();
      },
      error: () => alert('வினாவை நீக்குவதில் பிழை.')
    });
  }

  onCsvFileSelected(event: any): void {
    this.csvFileToUpload = event.target.files[0] || null;
  }

  downloadSampleCsv(): void {
    const csvContent = 'Question,Option A,Option B,Option C,Option D,Correct Answer\n' +
      'வேத ஜோதிடத்தில் எத்தனை ராசிகள் உள்ளன?,10,12,14,16,B\n' +
      'சூரியன் எந்த ராசியின் அதிபதி?,மேஷம்,ரிஷபம்,மிதுனம்,சிம்மம்,D\n' +
      'நவக்கிரகங்களில் குரு பகவானின் ராசி எது?,தனுசு,கடகம்,கன்னி,துலாம்,A\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'astrology_mcq_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async uploadCsvQuestions(): Promise<void> {
    if (!this.csvFileToUpload) {
      alert('தயவுசெய்து CSV கோப்பை தேர்வு செய்யவும்.');
      return;
    }
    const saved = await this.ensureExamSaved();
    if (!saved || !this.activeExamWizard.id) return;

    const formData = new FormData();
    formData.append('file', this.csvFileToUpload);
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}/import-csv`, formData, headers).subscribe({
      next: (res) => {
        alert(res.message || 'CSV வினாக்கள் வெற்றிகரமாக பதிவேற்றப்பட்டன!');
        this.loadExams();
      },
      error: (err) => alert(err?.error?.message || 'CSV பதிவேற்றுவதில் பிழை.')
    });
  }

  // --- EVALUATION ACTIONS ---
  openGradingModal(sub: any): void {
    this.selectedSubmissionForGrading = sub;
    const mcq = sub.mcq_score !== null && sub.mcq_score !== undefined ? sub.mcq_score : 40;
    const prac = sub.practical_score !== null && sub.practical_score !== undefined ? sub.practical_score : 45;
    const tot = sub.score !== null && sub.score !== undefined ? sub.score : (mcq + prac);

    this.gradingForm = {
      mcq_score: mcq,
      practical_score: prac,
      score: tot,
      status: sub.status === 'Approved' ? 'Approved' : (tot >= 40 ? 'Approved' : 'Rejected'),
      evaluator_notes: sub.evaluator_notes || 'ஜாதகக் கணிப்பு மதிப்பீடு செய்யப்பட்டது.',
      is_published: sub.is_published !== undefined ? !!sub.is_published : true
    };
  }

  updateTotalScore(): void {
    const mcq = Number(this.gradingForm.mcq_score) || 0;
    const prac = Number(this.gradingForm.practical_score) || 0;
    this.gradingForm.score = mcq + prac;
    if (this.gradingForm.score >= 40) {
      this.gradingForm.status = 'Approved';
    } else {
      this.gradingForm.status = 'Rejected';
    }
  }

  saveGrading(): void {
    if (!this.selectedSubmissionForGrading) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/submissions/${this.selectedSubmissionForGrading.id}/evaluate`, this.gradingForm, headers).subscribe({
      next: (res) => {
        alert(res.message || 'மதிப்பீடு வெற்றிகரமாக சேமிக்கப்பட்டது!');
        this.selectedSubmissionForGrading = null;
        this.loadSubmissions();
      },
      error: () => alert('மதிப்பீட்டை சேமிப்பதில் பிழை.')
    });
  }

  publishBatchResults(): void {
    if (!confirm('இந்த பேட்ச் மாணவர்களுக்கான தேர்வு முடிவுகளை வெளியிட விரும்புகிறீர்களா? (Publish Batch Results)')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/submissions/publish-batch`, { batch_id: this.selectedBatchId }, headers).subscribe({
      next: (res) => {
        alert(res.message || 'தேர்வு முடிவுகள் வெற்றிகரமாக வெளியிடப்பட்டன!');
        this.loadSubmissions();
      },
      error: () => alert('முடிவுகளை வெளியிடுவதில் பிழை.')
    });
  }
}
