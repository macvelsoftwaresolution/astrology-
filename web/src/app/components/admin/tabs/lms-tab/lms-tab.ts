import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { ToastService } from '../../../../services/toast.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'app-lms-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './lms-tab.html',
  styleUrls: ['../../admin-dashboard.css', './lms-tab.css']
})
export class LmsTabComponent implements OnInit {
  courses: any[] = [];
  seminars: any[] = [];
  materials: any[] = [];
  isLoading = false;

  // Search & Filter
  courseSearchQuery = '';
  selectedCourseLevelFilter = 'all';

  // Sub-tabs State
  activeSubTab: 'curriculum' | 'courses' | 'seminars' | 'live-classes' | 'materials' | 'exams' = 'curriculum';

  // --- 60-DAY DAILY CURRICULUM & BATCHES STATE ---
  batches: any[] = [];
  selectedBatchId: number | null = null;
  selectedBatch: any = null;
  curriculumDays: any[] = [];
  selectedYear: number = new Date().getFullYear();
  curriculumMonthFilter: 'all' | 'm1' | 'm2' | 'm3' = 'all';

  editingDayLesson: any = null;
  openDayEditorModal = false;
  copyFromBatchId: number | null = null;
  openCopyBatchModal = false;

  isUploadingDayAudio = false;
  isUploadingDayPdf = false;
  isUploadingDayImage = false;

  // Modals & Wizard State
  activeView: 'dashboard' | 'day-studio' | 'course-studio' | 'exam-studio' | 'seminar-studio' | 'live-class-studio' | 'material-studio' = 'dashboard';
  wizardStep = 1;
  newCourse: any = { title: '', description: '', price: 999, category: 'Astrology', level: 'Beginner', thumbnail: '' };
  wizardModules: any[] = [];

  openSyllabusDrawerModal = false;
  selectedCourseForSyllabus: any = null;

  openModuleModal = false;
  selectedCourseIdForModule: number | null = null;
  newModuleTitle = '';

  openLessonModal = false;
  selectedModuleIdForLesson: number | null = null;
  newLesson = { title: '', content_type: 'video', content_url: '', duration: '' };

  // Seminar & Material Modals
  openSeminarModal = false;
  editingSeminar: any = null;

  openMaterialModal = false;
  editingMaterial: any = null;

  // Category Selection State
  selectedCategory: 'ILANILAI' | 'MUTHUNILAI' | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public translationService: TranslationService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.loadBatches();
      this.loadCourses();
      this.loadSeminars();
      this.loadLiveClasses();
      this.loadMaterials();
      this.loadExams();
    }
  }

  private static cachedBatchesMap: Map<string, any[]> = new Map();

  // --- 60-DAY DAILY CURRICULUM METHODS ---
  loadBatches(): void {
    const headers = this.authService.getAuthHeaders();
    const level = this.selectedCategory || 'ILANILAI';
    const year = this.selectedYear;
    const cacheKey = `${year}-${level}`;

    // 1. Instant 0ms memory cache restore
    if (LmsTabComponent.cachedBatchesMap.has(cacheKey)) {
      const cached = LmsTabComponent.cachedBatchesMap.get(cacheKey)!;
      if (cached && cached.length > 0) {
        this.batches = cached;
        const targetBatch = (this.selectedBatchId && this.batches.find(b => b.id === this.selectedBatchId))
          ? this.selectedBatchId
          : this.batches[0].id;
        this.selectBatch(targetBatch);
      }
    }

    // 2. Fetch fresh DB batches from backend API
    this.http.get<any>(`${environment.apiUrl}/admin/lms/batches?year=${year}&level=${level}`, headers).subscribe({
      next: (res) => {
        if (res.batches && res.batches.length > 0) {
          LmsTabComponent.cachedBatchesMap.set(cacheKey, res.batches);
          this.batches = res.batches;
          const targetBatch = (this.selectedBatchId && this.batches.find(b => b.id === this.selectedBatchId))
            ? this.selectedBatchId
            : this.batches[0].id;
          this.selectBatch(targetBatch);
        }
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  selectBatch(batchId: number): void {
    this.selectedBatchId = batchId;
    this.selectedBatch = this.batches.find(b => b.id === batchId) || null;
    this.loadCurriculum();
  }

  getBatchDateRange(b: any): string {
    if (!b) return '';
    if (b.start_date && b.end_date) {
      try {
        const d1 = new Date(b.start_date);
        const d2 = new Date(b.end_date);
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return `${b.start_date} - ${b.end_date}`;
        const isTa = this.translationService.currentLanguage() === 'ta';
        const monthsTa = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];
        const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m1 = isTa ? monthsTa[d1.getMonth()] : monthsEn[d1.getMonth()];
        const m2 = isTa ? monthsTa[d2.getMonth()] : monthsEn[d2.getMonth()];
        return `${d1.getDate()} ${m1} ${d1.getFullYear()} - ${d2.getDate()} ${m2} ${d2.getFullYear()}`;
      } catch {
        return `${b.start_date} - ${b.end_date}`;
      }
    }
    return '';
  }

  loadCurriculum(): void {
    if (!this.selectedBatchId) return;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/lms/curriculum/${this.selectedBatchId}`, headers).subscribe({
      next: (res) => {
        this.curriculumDays = res.curriculum || [];
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  getBatchDisplayName(b: any): string {
    if (!b) return '';
    if (this.translationService.currentLanguage() === 'ta') {
      let name = b.name || '';
      name = name.replace(/Batch\s*1/gi, 'பிரிவு 1')
                 .replace(/Batch\s*2/gi, 'பிரிவு 2')
                 .replace(/Batch\s*3/gi, 'பிரிவு 3')
                 .replace(/Batch\s*4/gi, 'பிரிவு 4')
                 .replace(/Batch\s*A/gi, 'பிரிவு A')
                 .replace(/Batch\s*B/gi, 'பிரிவு B')
                 .replace(/Batch\s*C/gi, 'பிரிவு C')
                 .replace(/Batch\s*D/gi, 'பிரிவு D')
                 .replace(/Jan\s*-\s*Mar/gi, 'ஜன - மார்')
                 .replace(/Apr\s*-\s*Jun/gi, 'ஏப் - ஜூன்')
                 .replace(/Jul\s*-\s*Sep/gi, 'ஜூலை - செப்')
                 .replace(/Oct\s*-\s*Dec/gi, 'அக் - டிச')
                 .replace(/Feb\s*-\s*Apr/gi, 'பிப் - ஏப்')
                 .replace(/May\s*-\s*Jul/gi, 'மே - ஜூலை')
                 .replace(/Aug\s*-\s*Oct/gi, 'ஆக - அக்')
                 .replace(/Nov\s*-\s*Jan/gi, 'நவ - ஜன');
      return `${name} (${b.quarter || ''})`;
    }
    return `${b.name} (${b.quarter || ''})`;
  }

  getFilteredCurriculumDays(): any[] {
    const allDays = [];
    const isTa = this.translationService.currentLanguage() === 'ta';

    // Ensure all 60 days exist in display grid (Day 1 to 60)
    for (let i = 1; i <= 60; i++) {
      const found = this.curriculumDays.find(d => d.day_number === i);
      const defaultTitle = isTa
        ? `நாள் ${i}: பாடத் தலைப்பு அமைக்கப்படவில்லை`
        : `Day ${i}: Lesson Title Not Set`;

      allDays.push(found || {
        batch_id: this.selectedBatchId,
        day_number: i,
        title: defaultTitle,
        description: '',
        audio_url: '',
        images_json: [],
        pdf_material_url: '',
        is_published: true
      });
    }

    if (this.curriculumMonthFilter === 'm1') {
      return allDays.filter(d => d.day_number >= 1 && d.day_number <= 20);
    } else if (this.curriculumMonthFilter === 'm2') {
      return allDays.filter(d => d.day_number >= 21 && d.day_number <= 40);
    } else if (this.curriculumMonthFilter === 'm3') {
      return allDays.filter(d => d.day_number >= 41 && d.day_number <= 60);
    }
    return allDays;
  }

  openEditDay(day: any): void {
    const audios = Array.isArray(day.audios_json) && day.audios_json.length > 0
      ? [...day.audios_json]
      : (day.audio_url ? [{ title: 'குரல் பதிவு 1', url: day.audio_url }] : []);

    const pdfs = Array.isArray(day.pdfs_json) && day.pdfs_json.length > 0
      ? [...day.pdfs_json]
      : (day.pdf_material_url ? [{ title: 'பாடக் குறிப்பு PDF 1', url: day.pdf_material_url }] : []);

    this.editingDayLesson = {
      batch_id: this.selectedBatchId,
      day_number: day.day_number,
      title: day.title || `நாள் ${day.day_number}: பாடத் தலைப்பு`,
      description: day.description || '',
      audio_url: day.audio_url || '',
      audios_json: audios,
      images_json: Array.isArray(day.images_json) ? [...day.images_json] : [],
      pdf_material_url: day.pdf_material_url || '',
      pdfs_json: pdfs,
      is_published: day.is_published ?? true
    };
    this.activeView = 'day-studio';
    this.cdr.detectChanges();
  }

  cancelDayStudio(): void {
    this.activeView = 'dashboard';
    this.cdr.detectChanges();
  }

  // --- MULTIPLE AUDIOS HELPERS ---
  addAudioItem(): void {
    if (!this.editingDayLesson) return;
    if (!Array.isArray(this.editingDayLesson.audios_json)) {
      this.editingDayLesson.audios_json = [];
    }
    const nextIndex = this.editingDayLesson.audios_json.length + 1;
    this.editingDayLesson.audios_json.push({
      title: `குரல் பதிவு ${nextIndex}`,
      url: ''
    });
  }

  removeAudioItem(index: number): void {
    if (this.editingDayLesson && Array.isArray(this.editingDayLesson.audios_json)) {
      this.editingDayLesson.audios_json.splice(index, 1);
    }
  }

  uploadAudioItem(event: any, index: number): void {
    const file = event.target?.files?.[0];
    if (!file || !this.editingDayLesson) return;
    this.isUploadingDayAudio = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'lms_audio');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.editingDayLesson.audios_json[index]) {
          this.editingDayLesson.audios_json[index].url = res.url;
        }
        this.isUploadingDayAudio = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Audio upload failed.');
        this.isUploadingDayAudio = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- MULTIPLE PDFS HELPERS ---
  addPdfItem(): void {
    if (!this.editingDayLesson) return;
    if (!Array.isArray(this.editingDayLesson.pdfs_json)) {
      this.editingDayLesson.pdfs_json = [];
    }
    const nextIndex = this.editingDayLesson.pdfs_json.length + 1;
    this.editingDayLesson.pdfs_json.push({
      title: `பாடக் குறிப்பு PDF ${nextIndex}`,
      url: ''
    });
  }

  removePdfItem(index: number): void {
    if (this.editingDayLesson && Array.isArray(this.editingDayLesson.pdfs_json)) {
      this.editingDayLesson.pdfs_json.splice(index, 1);
    }
  }

  uploadPdfItem(event: any, index: number): void {
    const file = event.target?.files?.[0];
    if (!file || !this.editingDayLesson) return;
    this.isUploadingDayPdf = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'lms_pdf');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.editingDayLesson.pdfs_json[index]) {
          this.editingDayLesson.pdfs_json[index].url = res.url;
        }
        this.isUploadingDayPdf = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('PDF upload failed.');
        this.isUploadingDayPdf = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadDayImage(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;
    this.isUploadingDayImage = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'lms_images');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.editingDayLesson) {
          if (!Array.isArray(this.editingDayLesson.images_json)) {
            this.editingDayLesson.images_json = [];
          }
          this.editingDayLesson.images_json.push(res.url);
        }
        this.isUploadingDayImage = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Image upload failed.');
        this.isUploadingDayImage = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeDayImage(index: number): void {
    if (this.editingDayLesson && Array.isArray(this.editingDayLesson.images_json)) {
      this.editingDayLesson.images_json.splice(index, 1);
    }
  }

  saveDayLesson(): void {
    if (!this.editingDayLesson.title) {
      this.toastService.error('பாடத் தலைப்பு அவசியமானது.', 'விவரங்கள் தேவை');
      return;
    }

    // Legacy sync
    if (Array.isArray(this.editingDayLesson.audios_json) && this.editingDayLesson.audios_json.length > 0) {
      this.editingDayLesson.audio_url = this.editingDayLesson.audios_json[0].url;
    }
    if (Array.isArray(this.editingDayLesson.pdfs_json) && this.editingDayLesson.pdfs_json.length > 0) {
      this.editingDayLesson.pdf_material_url = this.editingDayLesson.pdfs_json[0].url;
    }

    const dayNum = this.editingDayLesson.day_number;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/lms/curriculum`, this.editingDayLesson, headers).subscribe({
      next: () => {
        this.toastService.success(
          `நாள் ${dayNum} பாடம் வெற்றிகரமாக சேமிக்கப்பட்டது!`,
          'பாடத் திட்டம் சேமிக்கப்பட்டது'
        );
        this.activeView = 'dashboard';
        this.loadCurriculum();
      },
      error: () => this.toastService.error('பாடத்தை சேமிப்பதில் பிழை ஏற்பட்டது.', 'பிழை ஏற்பட்டது')
    });
  }

  openCopyModal(): void {
    this.copyFromBatchId = null;
    this.openCopyBatchModal = true;
  }

  submitCopyBatch(): void {
    if (!this.copyFromBatchId || !this.selectedBatchId) {
      alert('Please select a source batch to copy from.');
      return;
    }
    if (!confirm('This will copy/overwrite curriculum lessons in the current batch. Continue?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/lms/curriculum/copy`, {
      from_batch_id: this.copyFromBatchId,
      to_batch_id: this.selectedBatchId
    }, headers).subscribe({
      next: (res) => {
        alert(res.message || 'Curriculum copied successfully!');
        this.openCopyBatchModal = false;
        this.loadCurriculum();
      },
      error: (err) => alert(err.error?.message || 'Failed to copy batch curriculum.')
    });
  }

  // --- EXAMS & QUIZZES STATE ---
  exams: any[] = [];
  activeExamWizard: any = null;
  newQuestion: any = { type: 'mcq', question_text: '', options: ['', '', '', ''], correct_answer: '', marks: 1 };

  loadExams(): void {
    const headers = this.authService.getAuthHeaders();
    if (this.selectedCategory) {
      this.http.get<any>(`${environment.apiUrl}/public/exams/${this.selectedCategory}`, headers).subscribe({
        next: (res) => {
          this.exams = res.exams || [];
          // If we are currently in exam-studio and editing an exam, update its questions
          if (this.activeView === 'exam-studio' && this.activeExamWizard && this.activeExamWizard.id) {
            const updatedExam = this.exams.find(e => e.id === this.activeExamWizard.id);
            if (updatedExam) {
              this.activeExamWizard.questions = updatedExam.questions || [];
            }
          }
          this.cdr.detectChanges();
        },
        error: () => { }
      });
    }
  }

  getFilteredExams(): any[] {
    return this.exams.filter(e => e.level === this.selectedCategory);
  }

  openNewExamWizard(): void {
    if (!this.selectedCategory) this.selectedCategory = 'ILANILAI';
    this.activeExamWizard = {
      title: '',
      duration: 30,
      total_marks: 100,
      pass_mark: 60,
      level: this.selectedCategory,
      questions: []
    };
    this.newQuestion = { type: 'mcq', question_text: '', options: ['', '', '', ''], correct_answer: '', marks: 1 };
    this.activeView = 'exam-studio';
    this.cdr.detectChanges();
  }

  manageExamQuestions(exam: any): void {
    this.activeExamWizard = { ...exam };
    if (!this.activeExamWizard.questions) this.activeExamWizard.questions = [];
    this.newQuestion = { type: 'mcq', question_text: '', options: ['', '', '', ''], correct_answer: '', marks: 1 };
    this.activeView = 'exam-studio';
    this.cdr.detectChanges();
  }

  cancelExamWizard(): void {
    this.activeExamWizard = null;
    this.activeView = 'dashboard';
    this.cdr.detectChanges();
  }

  saveExamDetails(): void {
    if (!this.activeExamWizard.title) return;
    const headers = this.authService.getAuthHeaders();
    const url = this.activeExamWizard.id
      ? `${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}`
      : `${environment.apiUrl}/admin/exams`;

    const req = this.activeExamWizard.id
      ? this.http.put<any>(url, this.activeExamWizard, headers)
      : this.http.post<any>(url, this.activeExamWizard, headers);

    req.subscribe({
      next: (res) => {
        alert('Exam details saved successfully!');
        if (!this.activeExamWizard.id && res.exam) {
          this.activeExamWizard.id = res.exam.id;
        }
        this.loadExams();
      },
      error: () => alert('Failed to save exam.')
    });
  }

  deleteExam(id: number): void {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/exams/${id}`, headers).subscribe({
      next: () => this.loadExams(),
      error: () => alert('Failed to delete exam.')
    });
  }

  saveQuestion(): void {
    if (!this.activeExamWizard.id) {
      alert('Please save the exam details first before adding questions.');
      return;
    }
    if (!this.newQuestion.question_text || !this.newQuestion.correct_answer) return;
    const headers = this.authService.getAuthHeaders();

    this.http.post<any>(`${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}/questions`, this.newQuestion, headers).subscribe({
      next: () => {
        this.loadExams();
        this.newQuestion = { type: 'mcq', question_text: '', options: ['', '', '', ''], correct_answer: '', marks: 1 };
      },
      error: () => alert('Failed to add question.')
    });
  }

  deleteQuestion(id: number): void {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/questions/${id}`, headers).subscribe({
      next: () => {
        this.loadExams();
      },
      error: () => alert('Failed to delete question.')
    });
  }

  isImportingPdf = false;

  importQuestionsFromPdf(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;
    if (!this.activeExamWizard.id) {
      alert('Please save the exam details first.');
      return;
    }

    this.isImportingPdf = true;
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.authService.getAuthHeaders();
    // Assuming authService.getAuthHeaders() returns { headers: HttpHeaders }
    // We shouldn't set Content-Type to application/json for FormData. Angular will set multipart/form-data automatically.
    // However, if getAuthHeaders sets Content-Type: application/json, we need to remove it.
    // Let's create a custom header object just with Authorization.

    // We'll trust getAuthHeaders for now, but usually FormData requires boundary. 
    // Usually we just pass headers without Content-Type. Let's see.
    this.http.post<any>(`${environment.apiUrl}/admin/exams/${this.activeExamWizard.id}/import-pdf`, formData, {
      headers: {
        Authorization: `Bearer ${typeof window !== 'undefined' ? sessionStorage.getItem('token') : ''}`
      }
    }).subscribe({
      next: (res) => {
        alert(res.message || 'Questions imported successfully!');
        this.loadExams(); // this will refresh activeExamWizard.questions
        this.isImportingPdf = false;
        event.target.value = ''; // reset file input
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert('Failed to import questions from PDF: ' + (err.error?.message || 'Unknown error'));
        this.isImportingPdf = false;
        event.target.value = ''; // reset file input
        this.cdr.detectChanges();
      }
    });
  }

  selectCategory(category: 'ILANILAI' | 'MUTHUNILAI'): void {
    this.selectedCategory = category;
    this.courseSearchQuery = '';
    this.selectedCourseLevelFilter = 'all';
    this.activeView = 'dashboard';
    this.selectedBatchId = null;
    this.selectedBatch = null;
    this.batches = [];
    this.loadBatches();
    this.loadExams();
    this.cdr.detectChanges();
  }

  clearCategory(): void {
    this.selectedCategory = null;
    this.activeView = 'dashboard';
    this.cdr.detectChanges();
  }

  loadCourses(): void {
    this.isLoading = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/admin/courses`, headers).subscribe({
      next: (res) => {
        this.courses = res.courses || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSeminars(): void {
    const headers = this.authService.getAuthHeaders();
    const url = this.selectedCategory ? `${environment.apiUrl}/admin/seminars/${this.selectedCategory}` : `${environment.apiUrl}/admin/seminars`;
    this.http.get<any>(url, headers).subscribe({
      next: (res) => {
        this.seminars = res.seminars || [];
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  liveClasses: any[] = [];
  openLiveClassModal = false;
  editingLiveClass: any = null;

  loadLiveClasses(): void {
    const headers = this.authService.getAuthHeaders();
    const url = this.selectedCategory ? `${environment.apiUrl}/admin/live-class/${this.selectedCategory}` : `${environment.apiUrl}/admin/live-class`;
    this.http.get<any>(url, headers).subscribe({
      next: (res) => {
        this.liveClasses = res.data || [];
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  weekDaysList = [
    { key: 'mon', label: 'திங்கள்', short: 'Mon' },
    { key: 'tue', label: 'செவ்வாய்', short: 'Tue' },
    { key: 'wed', label: 'புதன்', short: 'Wed' },
    { key: 'thu', label: 'வியாழன்', short: 'Thu' },
    { key: 'fri', label: 'வெள்ளி', short: 'Fri' },
    { key: 'sat', label: 'சனி', short: 'Sat' },
    { key: 'sun', label: 'ஞாயிறு', short: 'Sun' }
  ];

  timePresets = [
    { label: '🌅 காலை 06:00 - 07:30', start: '06:00', end: '07:30', text: 'காலை 06:00 - 07:30' },
    { label: '☀️ காலை 10:00 - 11:30', start: '10:00', end: '11:30', text: 'காலை 10:00 - 11:30' },
    { label: '🌆 மாலை 06:00 - 07:30', start: '18:00', end: '19:30', text: 'மாலை 06:00 - 07:30' },
    { label: '🌙 இரவு 07:30 - 09:00', start: '19:30', end: '21:00', text: 'இரவு 07:30 - 09:00' },
    { label: '🌙 இரவு 08:00 - 09:30', start: '20:00', end: '21:30', text: 'இரவு 08:00 - 09:30' }
  ];

  openNewLiveClass(): void {
    this.editingLiveClass = {
      id: null,
      title: '',
      description: '',
      days_of_week: ['mon', 'tue', 'wed', 'thu', 'fri'],
      date_text: 'திங்கள் - வெள்ளி',
      start_time: '18:00',
      end_time: '19:30',
      time_text: 'மாலை 06:00 - 07:30',
      link: '',
      is_active: true
    };
    this.activeView = 'live-class-studio';
  }

  editLiveClass(liveClass: any): void {
    let days = liveClass.days_of_week;
    if (typeof days === 'string') {
      try {
        days = JSON.parse(days);
      } catch {
        days = ['mon', 'tue', 'wed', 'thu', 'fri'];
      }
    }
    if (!Array.isArray(days)) {
      days = ['mon', 'tue', 'wed', 'thu', 'fri'];
    }

    this.editingLiveClass = {
      ...liveClass,
      days_of_week: days,
      start_time: liveClass.start_time || '18:00',
      end_time: liveClass.end_time || '19:30',
      date_text: liveClass.date_text || 'திங்கள் - வெள்ளி',
      time_text: liveClass.time_text || 'மாலை 06:00 - 07:30'
    };
    this.activeView = 'live-class-studio';
  }

  toggleLiveClassDay(key: string): void {
    if (!this.editingLiveClass.days_of_week) {
      this.editingLiveClass.days_of_week = [];
    }
    const idx = this.editingLiveClass.days_of_week.indexOf(key);
    if (idx > -1) {
      this.editingLiveClass.days_of_week.splice(idx, 1);
    } else {
      this.editingLiveClass.days_of_week.push(key);
    }
    this.updateDaysSummary();
  }

  isDaySelected(key: string): boolean {
    return this.editingLiveClass?.days_of_week?.includes(key) ?? false;
  }

  selectDaysPreset(type: 'all' | 'weekdays' | 'weekends'): void {
    if (type === 'all') {
      this.editingLiveClass.days_of_week = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    } else if (type === 'weekdays') {
      this.editingLiveClass.days_of_week = ['mon', 'tue', 'wed', 'thu', 'fri'];
    } else if (type === 'weekends') {
      this.editingLiveClass.days_of_week = ['sat', 'sun'];
    }
    this.updateDaysSummary();
  }

  updateDaysSummary(): void {
    const days = this.editingLiveClass.days_of_week || [];
    if (days.length === 7) {
      this.editingLiveClass.date_text = 'தினசரி (அனைத்து நாட்களும்)';
    } else if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) {
      this.editingLiveClass.date_text = 'திங்கள் - வெள்ளி (Mon - Fri)';
    } else if (days.length === 2 && days.includes('sat') && days.includes('sun')) {
      this.editingLiveClass.date_text = 'சனி, ஞாயிறு (வார இறுதி)';
    } else if (days.length === 0) {
      this.editingLiveClass.date_text = 'நாட்கள் தேர்வு செய்யப்படவில்லை';
    } else {
      const labels = this.weekDaysList.filter(d => days.includes(d.key)).map(d => d.label);
      this.editingLiveClass.date_text = labels.join(', ');
    }
  }

  selectTimePreset(preset: any): void {
    this.editingLiveClass.start_time = preset.start;
    this.editingLiveClass.end_time = preset.end;
    this.editingLiveClass.time_text = preset.text;
  }

  onCustomTimeChange(): void {
    const start = this.editingLiveClass.start_time || '18:00';
    const end = this.editingLiveClass.end_time || '19:30';

    const formatHour = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      const isPm = h >= 12;
      const h12 = h % 12 || 12;
      const padM = String(m).padStart(2, '0');
      const prefix = h < 12 ? 'காலை' : (h < 16 ? 'மதியம்' : (h < 20 ? 'மாலை' : 'இரவு'));
      return { str: `${String(h12).padStart(2, '0')}:${padM}`, prefix };
    };

    const s = formatHour(start);
    const e = formatHour(end);
    this.editingLiveClass.time_text = `${s.prefix} ${s.str} - ${e.str}`;
  }

  saveLiveClass(): void {
    if (!this.editingLiveClass.title || !this.editingLiveClass.link) {
      alert('Title and Link are required.');
      return;
    }
    if (!this.editingLiveClass.days_of_week || this.editingLiveClass.days_of_week.length === 0) {
      alert('தயவுசெய்து நேரடி வகுப்பிற்கான வார நாட்களைத் தேர்வு செய்யவும்.');
      return;
    }
    this.editingLiveClass.level = this.selectedCategory || 'ILANILAI';
    const headers = this.authService.getAuthHeaders();
    const url = this.editingLiveClass.id
      ? `${environment.apiUrl}/admin/live-class/${this.editingLiveClass.id}`
      : `${environment.apiUrl}/admin/live-class`;

    const req = this.http.post<any>(url, this.editingLiveClass, headers);

    req.subscribe({
      next: () => {
        this.activeView = 'dashboard';
        this.loadLiveClasses();
      },
      error: () => alert('Failed to save Live Class.')
    });
  }

  deleteLiveClass(id: number): void {
    if (!confirm('Are you sure you want to delete this Live Class?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/live-class/${id}`, headers).subscribe({
      next: () => this.loadLiveClasses(),
      error: () => alert('Failed to delete Live Class.')
    });
  }

  loadMaterials(): void {
    const headers = this.authService.getAuthHeaders();
    const url = this.selectedCategory ? `${environment.apiUrl}/admin/materials/${this.selectedCategory}` : `${environment.apiUrl}/admin/materials`;
    this.http.get<any>(url, headers).subscribe({
      next: (res) => {
        this.materials = res.materials || [];
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  openNewSeminar(): void {
    this.editingSeminar = {
      id: null,
      title: '',
      speaker: '',
      date_text: 'இன்று',
      time_text: 'மாலை 06:00 - 07:30',
      status: 'upcoming',
      join_url: '',
      category: this.selectedCategory // Optional if backend supports it
    };
    this.activeView = 'seminar-studio';
  }

  editSeminar(seminar: any): void {
    this.editingSeminar = { ...seminar };
    this.activeView = 'seminar-studio';
  }

  saveSeminar(): void {
    if (!this.editingSeminar.title || !this.editingSeminar.speaker) {
      alert('Title and Speaker are required.');
      return;
    }
    this.editingSeminar.level = this.selectedCategory || 'ILANILAI';
    const headers = this.authService.getAuthHeaders();
    const url = this.editingSeminar.id
      ? `${environment.apiUrl}/admin/seminars/${this.editingSeminar.id}`
      : `${environment.apiUrl}/admin/seminars`;

    const req = this.editingSeminar.id
      ? this.http.put<any>(url, this.editingSeminar, headers)
      : this.http.post<any>(url, this.editingSeminar, headers);

    req.subscribe({
      next: () => {
        this.activeView = 'dashboard';
        this.loadSeminars();
      },
      error: () => alert('Failed to save seminar.')
    });
  }

  deleteSeminar(id: number): void {
    if (!confirm('Are you sure you want to delete this seminar?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/seminars/${id}`, headers).subscribe({
      next: () => this.loadSeminars(),
      error: () => alert('Failed to delete seminar.')
    });
  }

  openNewMaterial(): void {
    this.editingMaterial = {
      id: null,
      course_id: 1, // Defaulting as in original code
      title: '',
      file_url: '',
      pages_text: '20 பக்கங்கள்',
      level: this.selectedCategory
    };
    this.activeView = 'material-studio';
  }

  isUploadingThumbnail = false;
  isUploadingLessonFile = false;
  isUploadingMaterial = false;

  uploadCourseThumbnail(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingThumbnail = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'courses');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url) {
          this.newCourse.thumbnail = res.url;
        }
        this.isUploadingThumbnail = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Thumbnail upload failed.');
        this.isUploadingThumbnail = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadLessonFile(event: any, isInline: boolean = false): void {
    const file = event.target.files[0];
    if (!file) return;
    this.isUploadingLessonFile = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'lessons');
    // Using global /api/upload route as defined in backend

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (isInline) {
          this.newInlineLesson.content_url = res.url;
        } else {
          this.newLesson.content_url = res.url;
        }
        this.isUploadingLessonFile = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('File upload failed.');
        this.isUploadingLessonFile = false;
        this.cdr.detectChanges();
      }
    });
  }

  uploadMaterialPdf(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;

    this.isUploadingMaterial = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'notes');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res && res.url && this.editingMaterial) {
          this.editingMaterial.file_url = res.url;
        }
        this.isUploadingMaterial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert('PDF upload failed.');
        this.isUploadingMaterial = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveMaterial(): void {
    if (!this.editingMaterial.title) {
      alert('Material title is required.');
      return;
    }
    this.editingMaterial.level = this.selectedCategory || 'ILANILAI';
    const headers = this.authService.getAuthHeaders();
    const url = this.editingMaterial.id
      ? `${environment.apiUrl}/admin/materials/${this.editingMaterial.id}`
      : `${environment.apiUrl}/admin/materials`;

    const req = this.editingMaterial.id
      ? this.http.put<any>(url, this.editingMaterial, headers)
      : this.http.post<any>(url, this.editingMaterial, headers);

    req.subscribe({
      next: () => {
        this.activeView = 'dashboard';
        this.loadMaterials();
      },
      error: () => alert('Failed to save study material.')
    });
  }

  deleteMaterial(id: number): void {
    if (!confirm('Are you sure you want to delete this study material?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/materials/${id}`, headers).subscribe({
      next: () => this.loadMaterials(),
      error: () => alert('Failed to delete material.')
    });
  }

  getFilteredCourses(): any[] {
    let list = this.courses;

    // Filter by selected category (ILANILAI or MUTHUNILAI)
    if (this.selectedCategory) {
      list = list.filter(c => c.level === this.selectedCategory);
    }

    if (this.courseSearchQuery && this.courseSearchQuery.trim()) {
      const q = this.courseSearchQuery.toLowerCase().trim();
      list = list.filter(c =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getFilteredMaterials(): any[] {
    let list = this.materials;
    if (this.selectedCategory) {
      // If the backend doesn't return `level` for materials, this might filter out everything.
      // But we requested to add it or filter by it. We'll filter based on the `level` property.
      list = list.filter(m => m.level === this.selectedCategory || !m.level);
      // Falling back to `!m.level` to not break existing data until backend is fully updated.
    }
    return list;
  }

  getCourseModulesCount(course: any): number {
    return course.modules?.length || 0;
  }

  getCourseLessonsCount(course: any): number {
    if (!course.modules) return 0;
    return course.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  }

  openNewCourseWizard(): void {
    if (!this.selectedCategory) {
      this.selectedCategory = 'ILANILAI';
    }
    this.wizardStep = 1;
    this.newCourse = {
      title: '',
      description: '',
      price: 999,
      category: 'Astrology',
      level: this.selectedCategory,
      thumbnail: ''
    };
    this.wizardModules = [
      { id: Date.now(), title: 'Level 1', lessons: [] }
    ];
    this.activeView = 'course-studio';
    this.cdr.detectChanges();
  }

  cancelCourseWizard(): void {
    this.activeView = 'dashboard';
    this.cdr.detectChanges();
  }

  openSyllabusDrawer(course: any): void {
    this.selectedCourseForSyllabus = course;
    this.openSyllabusDrawerModal = true;
  }

  openAddModule(courseId: number): void {
    this.selectedCourseIdForModule = courseId;
    this.newModuleTitle = '';
    this.openModuleModal = true;
  }

  openAddLesson(moduleId: number): void {
    this.selectedModuleIdForLesson = moduleId;
    this.newLesson = { title: '', content_type: 'video', content_url: '', duration: '' };
    this.openLessonModal = true;
  }

  submitModule(): void {
    if (!this.selectedCourseIdForModule || !this.newModuleTitle) return;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/courses/${this.selectedCourseIdForModule}/modules`, {
      title: this.newModuleTitle
    }, headers).subscribe({
      next: () => {
        alert('Module added successfully!');
        this.openModuleModal = false;
        this.loadCourses();
      },
      error: () => alert('Failed to add module.')
    });
  }

  submitLesson(): void {
    if (!this.selectedModuleIdForLesson || !this.newLesson.title || !this.newLesson.content_url) return;

    // If in Course Studio, save lesson to local wizard state
    if (this.activeView === 'course-studio') {
      const module = this.wizardModules.find(m => m.id === this.selectedModuleIdForLesson);
      if (module) {
        if (!module.lessons) module.lessons = [];
        module.lessons.push({ ...this.newLesson, id: Date.now() });
      }
      this.openLessonModal = false;
      this.cdr.detectChanges();
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/admin/modules/${this.selectedModuleIdForLesson}/lessons`, this.newLesson, headers).subscribe({
      next: () => {
        alert('Lesson added successfully!');
        this.openLessonModal = false;
        this.loadCourses();
      },
      error: () => alert('Failed to add lesson.')
    });
  }

  addModuleInWizard(): void {
    const nextNum = this.wizardModules.length + 1;
    const title = this.newModuleTitle && this.newModuleTitle.trim() !== ''
      ? this.newModuleTitle.trim()
      : `Level ${nextNum}`;

    this.wizardModules.push({
      id: Date.now(),
      title: title,
      lessons: []
    });
    this.newModuleTitle = '';
    this.cdr.detectChanges();
  }

  removeModuleInWizard(moduleId: number): void {
    if (confirm('இந்த நிலையை (Level) நீக்க விரும்புகிறீர்களா?')) {
      this.wizardModules = this.wizardModules.filter(m => m.id !== moduleId);
      if (this.activeLessonForm && this.activeLessonForm.moduleId === moduleId) {
        this.activeLessonForm = null;
      }
      this.cdr.detectChanges();
    }
  }

  removeLessonInWizard(moduleId: number, lessonId: number): void {
    const module = this.wizardModules.find(m => m.id === moduleId);
    if (module && module.lessons) {
      module.lessons = module.lessons.filter((l: any) => l.id !== lessonId);
      this.cdr.detectChanges();
    }
  }

  // INLINE LESSON FORM STATE
  activeLessonForm: { moduleId: number, type: string } | null = null;
  newInlineLesson: any = { title: '', content_type: 'video', content_url: '', duration: '', description: '' };

  openInlineLessonForm(moduleId: number): void {
    this.activeLessonForm = { moduleId, type: 'video' };
    this.newInlineLesson = { title: '', content_type: 'video', content_url: '', duration: '', description: '' };
    this.isUploadingLessonFile = false;
    this.cdr.detectChanges();
  }

  editInlineLesson(moduleId: number, lesson: any): void {
    this.activeLessonForm = { moduleId, type: 'video' };
    this.newInlineLesson = { ...lesson };
    this.isUploadingLessonFile = false;
    this.cdr.detectChanges();
  }

  cancelInlineLessonForm(): void {
    this.activeLessonForm = null;
    this.cdr.detectChanges();
  }

  submitInlineLesson(): void {
    if (!this.activeLessonForm) return;
    if (!this.newInlineLesson.title || this.newInlineLesson.title.trim() === '') {
      alert('தயவுசெய்து பாடத்தின் தலைப்பை (Title) உள்ளிடவும்.');
      return;
    }
    const type = this.newInlineLesson.content_type;
    if (type !== 'text' && !this.newInlineLesson.content_url) {
      alert('தயவுசெய்து கோப்பை (File / Link) வழங்கவும்.');
      return;
    }
    if (type === 'text' && (!this.newInlineLesson.description || this.newInlineLesson.description.trim() === '')) {
      alert('தயவுசெய்து உரையை (Content) உள்ளிடவும்.');
      return;
    }
    const module = this.wizardModules.find(m => m.id === this.activeLessonForm!.moduleId);
    if (module) {
      if (!module.lessons) module.lessons = [];
      if (this.newInlineLesson.id) {
        const idx = module.lessons.findIndex((l: any) => l.id === this.newInlineLesson.id);
        if (idx !== -1) {
          module.lessons[idx] = { ...this.newInlineLesson };
        }
      } else {
        module.lessons.push({ ...this.newInlineLesson, id: Date.now() });
      }
    }
    this.activeLessonForm = null;
    this.cdr.detectChanges();
  }

  editCourse(course: any): void {
    this.newCourse = { ...course };
    // Deep clone modules so we can edit without mutating the original until saved
    this.wizardModules = course.modules && course.modules.length > 0
      ? JSON.parse(JSON.stringify(course.modules))
      : [{ id: Date.now(), title: 'Level 1', lessons: [] }];
    this.activeView = 'course-studio';
    this.cdr.detectChanges();
  }

  // MODAL LESSON LOGIC (kept for dashboard view)
  publishWizardCourse(): void {
    const payload = {
      ...this.newCourse,
      modules: this.wizardModules
    };
    const headers = this.authService.getAuthHeaders();

    // If it has an id, it's an update (PUT)
    if (this.newCourse.id) {
      this.http.put<any>(`${environment.apiUrl}/admin/courses/${this.newCourse.id}`, payload, headers).subscribe({
        next: () => {
          alert('Course updated successfully!');
          this.activeView = 'dashboard';
          this.loadCourses();
        },
        error: () => alert('Failed to update course.')
      });
    } else {
      // Otherwise create new (POST)
      this.http.post<any>(`${environment.apiUrl}/admin/courses`, payload, headers).subscribe({
        next: () => {
          alert('Course created and published live successfully!');
          this.activeView = 'dashboard';
          this.loadCourses();
        },
        error: () => alert('Failed to publish course.')
      });
    }
  }

  deleteCourse(id: number): void {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const headers = this.authService.getAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/admin/courses/${id}`, headers).subscribe({
      next: () => {
        alert('Course deleted successfully.');
        this.loadCourses();
      },
      error: () => alert('Failed to delete course.')
    });
  }
}


