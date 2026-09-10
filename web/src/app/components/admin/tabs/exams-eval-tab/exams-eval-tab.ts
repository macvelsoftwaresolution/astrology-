import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { ToastService } from '../../../../services/toast.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-exams-eval-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './exams-eval-tab.html',
  styleUrls: ['../../admin-dashboard.css', './exams-eval-tab.css', '../certificates-tab/certificates-tab.css']
})
export class ExamsEvalTabComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  public translationService = inject(TranslationService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  activeView: 'list' | 'exam-wizard' | 'evaluation' | 'analytics' = 'list';
  selectedCategory = 'ILANILAI';

  // Certificate & Marksheet Quick Preview Modal State
  showDocPreviewModal = false;
  activeDocPreview: {
    title: string;
    type: 'certificate' | 'marksheet';
    sub: any;
    cert: any;
  } | null = null;

  exams: any[] = [];
  batches: any[] = [];
  selectedBatchId: any = '';

  // 1. Exam Wizard State
  activeExamWizard: any = null;
  newQuestion = {
    type: 'mcq',
    question_text: '',
    optionsList: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ],
    marks: 10
  };
  csvFileToUpload: File | null = null;


  // 3. Evaluation & Submissions State
  submissions: any[] = [];
  isLoadingSubmissions = false;
  selectedSubmissionForGrading: any = null;
  gradingForm = {
    mcq_score: 0,
    practical_score: 0,
    score: 0,
    status: 'Approved',
    courier_name: '',
    courier_tracking_no: '',
    evaluator_notes: '',
    is_published: true
  };

  constructor() {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadExams();
      this.loadBatches();
      this.loadSubmissions();
      this.loadAnalytics();
    }
  }

  // --- DYNAMIC METRICS COMPUTATION ---
  get filteredSubmissions(): any[] {
    return this.submissions;
  }

  get totalExamsCount(): number {
    return this.exams.length;
  }

  get totalSubmissionsCount(): number {
    return this.submissions.length;
  }

  get passedSubmissionsCount(): number {
    return this.submissions.filter(s => {
      const st = (s.status || '').toLowerCase();
      const score = Number(s.score !== null && s.score !== undefined && s.score > 0 ? s.score : ((s.mcq_score || 0) + (s.practical_score || 0)));
      return st === 'approved' || score >= 40;
    }).length;
  }

  get pendingEvaluationCount(): number {
    return this.submissions.filter(s => {
      const st = (s.status || '').toLowerCase();
      const score = s.score !== null && s.score !== undefined && s.score > 0 ? Number(s.score) : ((s.mcq_score !== null || s.practical_score !== null) ? ((s.mcq_score || 0) + (s.practical_score || 0)) : null);
      return (st === 'pending' || !s.status) && (score === null || score < 40 || s.submission_type === 'pdf_upload' || s.submission_type === 'practical_assignment');
    }).length;
  }

  get passRatePercentage(): number {
    if (this.totalSubmissionsCount === 0) return 0;
    return Math.round((this.passedSubmissionsCount / this.totalSubmissionsCount) * 100);
  }

  get averageScore(): number {
    const list = this.submissions.filter(s => s.score !== null && s.score !== undefined);
    if (list.length === 0) return 0;
    const total = list.reduce((acc, s) => acc + (Number(s.score) || 0), 0);
    return Math.round(total / list.length);
  }

  getLevelTranslationKey(level: string | undefined): string {
    if (!level) return 'courses.ilanilai';
    const l = level.toLowerCase();
    if (l === 'muthunilai' || l === 'pg' || level === 'முதுநிலை') return 'courses.muthunilai';
    if (l === 'research' || level === 'ஆராய்ச்சி') return 'courses.research';
    return 'courses.ilanilai';
  }



  // --- DYNAMIC TOPIC-WISE PERFORMANCE ANALYTICS (100% DATABASE DRIVEN) ---
  backendAnalytics: any = null;

  get dynamicTopicAnalytics(): any[] {
    return this.backendAnalytics?.topics || [];
  }

  get dynamicWeakestTopic(): any {
    return this.backendAnalytics?.weakest_topic || null;
  }

  loadAnalytics(): void {
    const headers = this.authService.getAuthHeaders();
    let url = `${environment.apiUrl}/admin/exam-analytics?level=${this.selectedCategory}`;
    if (this.selectedBatchId) {
      url += `&batch_id=${this.selectedBatchId}`;
    }
    this.http.get<any>(url, headers).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.backendAnalytics = res;
        }
        this.cdr?.markForCheck();
      },
      error: () => {}
    });
  }

  loadExams(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/public/exams/${this.selectedCategory}`, headers).subscribe({
      next: (res) => {
        this.exams = res.exams || [];
        this.loadAnalytics();
        this.cdr?.markForCheck();
      },
      error: () => {}
    });
  }

  loadBatches(): void {
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/lms/batches`, headers).subscribe({
      next: (res) => {
        this.batches = res.batches || res || [];
        this.cdr?.markForCheck();
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
        this.cdr?.markForCheck();
      },
      error: () => {
        this.isLoadingSubmissions = false;
        this.cdr?.markForCheck();
      }
    });
  }



  // --- EXAM WIZARD ACTIONS ---
  openCreateExam(): void {
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    this.activeExamWizard = {
      id: null,
      level: this.selectedCategory,
      title: '',
      duration: 60,
      grace_period_mins: 20,
      start_time: localIso,
      total_marks: 100,
      pass_mark: 40,
      pass_percentage: 50,
      practical_prompt: '',
      chart_image_url: '',
      batch_id: this.selectedBatchId || null,
      questions: []
    };
    this.activeView = 'exam-wizard';
  }

  editExam(exam: any): void {
    let formattedDate = exam.start_time || exam.exam_date || '';
    if (formattedDate && !formattedDate.includes('T') && formattedDate.includes(' ')) {
      formattedDate = formattedDate.replace(' ', 'T').slice(0, 16);
    }
    this.activeExamWizard = {
      ...exam,
      start_time: formattedDate,
      grace_period_mins: exam.grace_period_mins !== undefined ? exam.grace_period_mins : 20,
      pass_percentage: exam.pass_percentage || 50
    };
    if (!this.activeExamWizard.questions) this.activeExamWizard.questions = [];
    
    this.activeView = 'exam-wizard';
  }

  saveExam(): void {
    if (!this.activeExamWizard.title) {
      this.toastService.warning('தயவுசெய்து தேர்வின் தலைப்பை உள்ளிடவும்.', 'விவரங்கள் தேவை');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    const isEdit = !!this.activeExamWizard.id;
    const url = isEdit
      ? `${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}`
      : `${environment.apiUrl}/admin/exams`;

    const payload = {
      level: this.activeExamWizard.level || this.selectedCategory || 'ILANILAI',
      title: this.activeExamWizard.title,
      duration: Number(this.activeExamWizard.duration) || 60,
      grace_period_mins: Number(this.activeExamWizard.grace_period_mins) || 20,
      start_time: this.activeExamWizard.start_time || null,
      exam_date: this.activeExamWizard.start_time || null,
      total_marks: Number(this.activeExamWizard.total_marks) || 100,
      pass_mark: Number(this.activeExamWizard.pass_mark) || 40,
      practical_prompt: this.activeExamWizard.practical_prompt || null,
      chart_image_url: this.activeExamWizard.chart_image_url || null,
      batch_id: this.activeExamWizard.batch_id ? Number(this.activeExamWizard.batch_id) : null
    };

    const request$ = isEdit
      ? this.http.put<any>(url, payload, headers)
      : this.http.post<any>(url, payload, headers);

    request$.subscribe({
      next: (res: any) => {
        this.toastService.success(res?.message || 'தேர்வு வெற்றிகரமாக சேமிக்கப்பட்டது!');
        if (!isEdit && res?.exam_id) {
          this.activeExamWizard.id = res.exam_id;
        }
        this.loadExams();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'தேர்வை சேமிப்பதில் பிழை ஏற்பட்டது.')
    });
  }

  // --- RE-ATTEMPT MANAGEMENT (OPTION 1 + 4) ---
  selectedSubForReattempt: any = null;
  showReattemptModal = false;
  reattemptForm: any = {
    reattempt_exam_id: null,
    reattempt_start_time: '',
    notes: ''
  };

  openReattemptModal(sub: any): void {
    this.selectedSubForReattempt = sub;
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    this.reattemptForm = {
      reattempt_exam_id: sub.exam_id || (this.exams[0]?.id || null),
      reattempt_start_time: localIso,
      notes: 'மறுதேர்வுக்கான அனுமதி வழங்கப்பட்டது. குறிப்பிட்ட நேரத்தில் தேர்வு எழுதலாம்.'
    };
    this.showReattemptModal = true;
    this.cdr.markForCheck();
  }

  closeReattemptModal(): void {
    this.showReattemptModal = false;
    this.selectedSubForReattempt = null;
    this.cdr.markForCheck();
  }

  saveReattempt(): void {
    if (!this.selectedSubForReattempt) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/submissions/${this.selectedSubForReattempt.id}/schedule-reattempt`, this.reattemptForm, headers).subscribe({
      next: (res) => {
        this.toastService.success(res?.message || 'மாணவருக்கு மறுதேர்வு வெற்றிகரமாக அட்டவணைப்படுத்தப்பட்டது!');
        this.closeReattemptModal();
        this.loadSubmissions();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'மறுதேர்வு அட்டவணைப்படுத்துவதில் பிழை ஏற்பட்டது.');
      }
    });
  }

  async deleteExam(id: number): Promise<void> {
    const ok = await this.confirmService.confirm({
      title: 'தேர்வை நீக்கவா?',
      message: 'இந்த தேர்வு நிரந்தரமாக நீக்கப்படும். நிச்சயமாக நீக்க வேண்டுமா?',
      confirmText: 'ஆம், நீக்குக',
      type: 'danger',
      icon: 'bi bi-trash3-fill'
    });
    if (!ok) return;

    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/exams/${id}`, headers).subscribe({
      next: () => {
        this.toastService.success('தேர்வு நீக்கப்பட்டது.');
        this.loadExams();
        if (this.activeView === 'exam-wizard') this.activeView = 'list';
      },
      error: () => this.toastService.error('தேர்வை நீக்குவதில் பிழை ஏற்பட்டது.')
    });
  }



  async ensureExamSaved(): Promise<boolean> {
    if (this.activeExamWizard.id) return true;
    if (!this.activeExamWizard.title) {
      this.toastService.warning('தயவுசெய்து தேர்வின் தலைப்பை (Title) உள்ளிடவும்.', 'விவரங்கள் தேவை');
      return false;
    }
    const headers = this.authService.getAuthHeaders();
    const payload = {
      level: this.activeExamWizard.level || this.selectedCategory || 'ILANILAI',
      title: this.activeExamWizard.title,
      duration: Number(this.activeExamWizard.duration) || 60,
      total_marks: Number(this.activeExamWizard.total_marks) || 100,
      pass_mark: Number(this.activeExamWizard.pass_mark) || 40,
      practical_prompt: this.activeExamWizard.practical_prompt || null,
      chart_image_url: this.activeExamWizard.chart_image_url || null,
      batch_id: this.activeExamWizard.batch_id ? Number(this.activeExamWizard.batch_id) : null
    };
    try {
      const res: any = await this.http.post<any>(`${environment.apiUrl}/admin/exams`, payload, headers).toPromise();
      if (res && res.exam_id) {
        this.activeExamWizard.id = res.exam_id;
        this.loadExams();
        return true;
      }
    } catch (e: any) {
      this.toastService.error(e?.error?.message || 'தேர்வை சேமிப்பதில் பிழை ஏற்பட்டது.');
      return false;
    }
    return false;
  }

  async addQuestion(): Promise<void> {
    if (!this.newQuestion.question_text.trim()) {
      this.toastService.warning('தயவுசெய்து வினாவின் கேள்வியை உள்ளிடவும்.', 'விவரங்கள் தேவை');
      return;
    }

    const filledOptions = this.newQuestion.optionsList
      .map(o => o.text.trim())
      .filter(t => t.length > 0);

    if (filledOptions.length < 2) {
      this.toastService.warning('குறைந்தது 2 விருப்பங்களுக்கு (Options) விடையை உள்ளிடவும்.', 'விவரங்கள் தேவை');
      return;
    }

    const correctObj = this.newQuestion.optionsList.find(o => o.is_correct && o.text.trim().length > 0);
    const correctVal = correctObj ? correctObj.text.trim() : filledOptions[0];

    const saved = await this.ensureExamSaved();
    if (!saved || !this.activeExamWizard.id) return;

    const headers = this.authService.getAuthHeaders();
    const payload = {
      type: 'mcq',
      question_text: this.newQuestion.question_text.trim(),
      options: filledOptions,
      correct_answer: correctVal,
      marks: this.newQuestion.marks || 10
    };

    this.http.post<any>(`${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}/questions`, payload, headers).subscribe({
      next: (res) => {
        if (!this.activeExamWizard.questions) this.activeExamWizard.questions = [];
        this.activeExamWizard.questions.push({ ...payload, id: res.question_id });
        this.toastService.success('வினா சேர்க்கப்பட்டது!');
        this.newQuestion = {
          type: 'mcq',
          question_text: '',
          optionsList: [
            { text: '', is_correct: true },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false }
          ],
          marks: 10
        };
        this.cdr?.markForCheck();
      },
      error: () => this.toastService.error('வினாவை சேர்ப்பதில் பிழை.')
    });
  }

  addDynamicOption(): void {
    if (this.newQuestion.optionsList.length >= 8) {
      this.toastService.warning('அதிகபட்சம் 8 விருப்பங்கள் மட்டுமே சேர்க்க முடியும்.', 'வரம்பு');
      return;
    }
    this.newQuestion.optionsList.push({ text: '', is_correct: false });
  }

  removeDynamicOption(index: number): void {
    if (this.newQuestion.optionsList.length <= 2) {
      this.toastService.warning('குறைந்தது 2 விருப்பங்கள் (Options) இருக்க வேண்டும்.', 'வரம்பு');
      return;
    }
    const wasCorrect = this.newQuestion.optionsList[index].is_correct;
    this.newQuestion.optionsList.splice(index, 1);
    if (wasCorrect && this.newQuestion.optionsList.length > 0) {
      this.newQuestion.optionsList[0].is_correct = true;
    }
  }

  setCorrectOption(index: number): void {
    this.newQuestion.optionsList.forEach((opt, idx) => {
      opt.is_correct = (idx === index);
    });
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D, E, F, G, H...
  }

  formatQuestionOptions(options: any): string[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return options.split(',').map(s => s.trim()).filter(s => !!s);
    }
    return [];
  }

  deleteQuestion(id: number, idx: number): void {
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/questions/${id}`, headers).subscribe({
      next: () => {
        this.activeExamWizard.questions.splice(idx, 1);
        this.toastService.success('வினா நீக்கப்பட்டது.');
        this.cdr?.markForCheck();
      },
      error: () => this.toastService.error('வினாவை நீக்குவதில் பிழை.')
    });
  }

  onCsvFileSelected(event: any): void {
    this.csvFileToUpload = event.target.files[0] || null;
  }

  downloadSampleCsv(): void {
    let csvRows = ['Question,Option A,Option B,Option C,Option D,Correct Answer'];
    
    // If current exam has questions in database/wizard, export those dynamically
    if (this.activeExamWizard?.questions && this.activeExamWizard.questions.length > 0) {
      this.activeExamWizard.questions.forEach((q: any) => {
        const opts = this.formatQuestionOptions(q.options);
        const optA = opts[0] ? `"${opts[0].replace(/"/g, '""')}"` : '""';
        const optB = opts[1] ? `"${opts[1].replace(/"/g, '""')}"` : '""';
        const optC = opts[2] ? `"${opts[2].replace(/"/g, '""')}"` : '""';
        const optD = opts[3] ? `"${opts[3].replace(/"/g, '""')}"` : '""';
        const qText = `"${(q.question_text || '').replace(/"/g, '""')}"`;
        const correct = `"${(q.correct_answer || '').replace(/"/g, '""')}"`;
        csvRows.push(`${qText},${optA},${optB},${optC},${optD},${correct}`);
      });
    } else {
      // Standard Blank Template Row
      csvRows.push('"","","","","",""');
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mcq_questions_template_${this.selectedCategory.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async uploadCsvQuestions(): Promise<void> {
    if (!this.csvFileToUpload) {
      this.toastService.warning('தயவுசெய்து CSV கோப்பை தேர்வு செய்யவும்.', 'கோப்பு தேவை');
      return;
    }
    const saved = await this.ensureExamSaved();
    if (!saved || !this.activeExamWizard.id) return;

    const formData = new FormData();
    formData.append('file', this.csvFileToUpload);
    const headers = this.authService.getUploadHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}/import-csv`, formData, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'CSV வினாக்கள் வெற்றிகரமாக பதிவேற்றப்பட்டன!');
        this.loadExams();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'CSV பதிவேற்றுவதில் பிழை.')
    });
  }

  openGradingModal(sub: any): void {
    this.selectedSubmissionForGrading = sub;
    let mcq = 0;
    let prac = 0;
    let tot = 0;

    if (sub.submission_type === 'online_quiz') {
      mcq = sub.score !== null ? Number(sub.score) : Number(sub.mcq_score || 100);
      prac = 0;
      tot = mcq;
    } else if (sub.submission_type === 'physical_courier' || sub.submission_type === 'practical_assignment') {
      mcq = 0;
      prac = sub.practical_score !== null ? Number(sub.practical_score) : Number(sub.score || 85);
      tot = prac;
    } else {
      mcq = sub.mcq_score !== null ? Number(sub.mcq_score) : 40;
      prac = sub.practical_score !== null ? Number(sub.practical_score) : 45;
      tot = mcq + prac;
    }

    this.gradingForm = {
      mcq_score: mcq,
      practical_score: prac,
      score: tot,
      status: (sub.status === 'Approved' || tot >= 40) ? 'Approved' : 'Rejected',
      courier_name: sub.courier_name || '',
      courier_tracking_no: sub.courier_tracking_no || '',
      evaluator_notes: sub.evaluator_notes || 'மதிப்பீடு செய்யப்பட்டது. தேர்ச்சி பெற்றார்.',
      is_published: sub.is_published !== undefined ? !!sub.is_published : true
    };
  }

  updateTotalScore(): void {
    if (this.selectedSubmissionForGrading?.submission_type === 'online_quiz') {
      this.gradingForm.score = Number(this.gradingForm.mcq_score) || 0;
    } else if (this.selectedSubmissionForGrading?.submission_type === 'physical_courier' || this.selectedSubmissionForGrading?.submission_type === 'practical_assignment') {
      this.gradingForm.score = Number(this.gradingForm.practical_score) || 0;
    } else {
      const mcq = Number(this.gradingForm.mcq_score) || 0;
      const prac = Number(this.gradingForm.practical_score) || 0;
      this.gradingForm.score = mcq + prac;
    }

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
        this.toastService.success(res.message || 'மதிப்பீடு வெற்றிகரமாக சேமிக்கப்பட்டது!');
        this.selectedSubmissionForGrading = null;
        this.loadSubmissions();
      },
      error: () => this.toastService.error('மதிப்பீட்டை சேமிப்பதில் பிழை.')
    });
  }

  async issueCertificateForStudent(sub: any): Promise<void> {
    const ok = await this.confirmService.confirm({
      title: 'டிஜிட்டல் சான்றிதழ் உருவாக்கவா?',
      message: `${sub.student_name} அவர்களுக்கு டிஜிட்டல் சான்றிதழ் உருவாக்க விரும்புகிறீர்களா?`,
      confirmText: 'ஆம், உருவாக்கு',
      type: 'primary',
      icon: 'bi bi-award-fill'
    });
    if (!ok) return;

    const headers = this.authService.getAuthHeaders();
    const payload = {
      student_id: sub.student_id,
      course_id: sub.course_id || 1,
      exam_id: sub.exam_id || null,
      student_name: sub.student_name,
      course_title: sub.course_title || 'ஜோதிட இளநிலை படிப்பு',
      percentage: sub.score || 85,
      grade: (sub.score >= 80) ? 'Distinction' : ((sub.score >= 60) ? 'First Class' : 'Pass')
    };

    this.http.post<any>(`${environment.apiUrl}/admin/certificates`, payload, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || `சான்றிதழ் வெற்றிகரமாக உருவாக்கப்பட்டது! எண்: ${res.certificate?.certificate_number || 'ASTRO-CERT'}`);
        this.loadSubmissions();
      },
      error: () => this.toastService.error('சான்றிதழ் உருவாக்குவதில் பிழை.')
    });
  }

  async publishBatchResults(): Promise<void> {
    const ok = await this.confirmService.confirm({
      title: 'முடிவுகளை வெளியிடவா?',
      message: 'இந்த பேட்ச் மாணவர்களுக்கான தேர்வு முடிவுகளை வெளியிட விரும்புகிறீர்களா? (Publish Batch Results)',
      confirmText: 'ஆம், வெளியிடு',
      type: 'warning',
      icon: 'bi bi-megaphone-fill'
    });
    if (!ok) return;

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/submissions/publish-batch`, { batch_id: this.selectedBatchId }, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'தேர்வு முடிவுகள் வெற்றிகரமாக வெளியிடப்பட்டன!');
        this.loadSubmissions();
      },
      error: () => this.toastService.error('முடிவுகளை வெளியிடுவதில் பிழை.')
    });
  }

  async deleteSubmission(id: number): Promise<void> {
    const ok = await this.confirmService.confirm({
      title: 'சமர்ப்பிப்பை நீக்கவா?',
      message: 'இந்த தேர்வு சமர்ப்பிப்பை நீக்க விரும்புகிறீர்களா? (Delete this submission?)',
      confirmText: 'ஆம், நீக்குக',
      type: 'danger',
      icon: 'bi bi-trash3-fill'
    });
    if (!ok) return;

    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/submissions/${id}`, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'சமர்ப்பிப்பு நீக்கப்பட்டது.');
        this.loadSubmissions();
      },
      error: () => this.toastService.error('நீக்குவதில் பிழை.')
    });
  }

  // ==========================================
  // CERTIFICATE & MARKSHEET ACTIONS
  // ==========================================

  previewDoc(sub: any, type: 'certificate' | 'marksheet'): void {
    const cert = sub.certificate || {
      certificate_number: sub.certificate_number || 'ASTRO-CERT-2026',
      marksheet_number: sub.marksheet_number || 'ASTRO-MRK-2026',
      student_name_ta: sub.student_name,
      student_name_en: (sub.student_name || '').toUpperCase(),
      registration_number: sub.student_code || '26AR01',
      center_name: 'பல்லடம்',
      center_name_en: 'PALLADAM',
      course_level: 'UG',
      award_title_ta: sub.award_title_ta || 'ஜோதிட ரத்னா',
      award_title_en: sub.award_title_en || 'JOTHIDA RATHNA',
      course_period_from: '06.02.2018',
      course_period_to: '06.02.2019',
      exam_date: '28.01.2019',
      academic_year: '2018 FEB to 2019 FEB',
      issue_date: new Date().toLocaleDateString('en-GB'),
      issue_place: 'பெரியகுளம்',
      theory1_mark: 98,
      theory2_mark: 90,
      practical1_mark: 92,
      practical2_mark: 87,
      practical3_mark: 93,
      total_marks: sub.cert_total_marks || 460,
      percentage: sub.cert_percentage || '92%',
      grade: sub.cert_grade || 'First Class',
      pass_status: sub.cert_pass_status || 'PASS',
      pdf_download_url: sub.cert_pdf_url,
      marksheet_download_url: sub.marksheet_download_url
    };

    this.activeDocPreview = {
      title: this.translationService.currentLanguage() === 'ta'
        ? (type === 'certificate' ? 'சான்றிதழ் முன்னோட்டம்' : 'மதிப்பெண் பட்டியல் முன்னோட்டம்')
        : (type === 'certificate' ? 'Certificate Preview' : 'Marksheet Preview'),
      type,
      sub,
      cert
    };
    this.showDocPreviewModal = true;
    this.cdr.markForCheck();
  }

  closeDocPreview(): void {
    this.showDocPreviewModal = false;
    this.activeDocPreview = null;
    this.cdr.markForCheck();
  }

  printDocPreview(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  async publishSingleSubmission(sub: any): Promise<void> {
    const ok = await this.confirmService.confirm({
      title: 'மாணவருக்கு சான்றிதழ் & தேர்வு முடிவு வெளியிடவா?',
      message: `${sub.student_name} மாணவருக்கு தேர்வு முடிவு மற்றும் சான்றிதழை வெளியிட விரும்புகிறீர்களா? வெளியிட்டவுடன் மாணவர் தனது மொபைல் ஆப்பில் உடனே பார்க்க மற்றும் பதிவிறக்கம் செய்ய முடியும்.`,
      confirmText: 'ஆம், வெளியிடு (Publish)',
      type: 'warning',
      icon: 'bi bi-send-fill'
    });
    if (!ok) return;

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/submissions/${sub.id}/publish`, {}, headers).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'தேர்வு முடிவு & சான்றிதழ் மாணவருக்கு வெளியிடப்பட்டது!');
        sub.is_published = true;
        this.loadSubmissions();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'வெளியிடுவதில் பிழை ஏற்பட்டது.');
      }
    });
  }

  createCertificateFor(sub: any): void {
    this.router.navigate(['/admin/certificates'], { queryParams: { student_id: sub.student_id } });
  }
}
