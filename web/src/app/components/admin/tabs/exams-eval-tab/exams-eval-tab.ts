import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

export interface ChartHouse {
  id: string;
  name: string;
  rasiNo: number;
  gridPos: string;
  planets: string[];
}

@Component({
  selector: 'app-exams-eval-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './exams-eval-tab.html',
  styleUrls: ['../../admin-dashboard.css', './exams-eval-tab.css']
})
export class ExamsEvalTabComponent implements OnInit {
  activeView: 'list' | 'exam-wizard' | 'evaluation' | 'leaderboard' | 'analytics' = 'list';
  selectedCategory = 'ILANILAI';

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
  chartImageToUpload: File | null = null;
  isUploadingChart = false;
  chartMode: 'interactive' | 'upload' = 'interactive';

  // 2. Interactive Astrology 12-House Chart Builder State
  availablePlanets: string[] = [
    'லக்', 'சூரி', 'சந்', 'செவ்', 'புத', 'குரு', 'சுக்', 'சனி', 'ராகு', 'கேது', 'மா'
  ];
  selectedPlanetTool: string = 'லக்';

  chartHouses: ChartHouse[] = [
    { id: 'meenam', name: 'மீனம்', rasiNo: 12, gridPos: '1 / 1', planets: [] },
    { id: 'mesham', name: 'மேஷம்', rasiNo: 1, gridPos: '1 / 2', planets: [] },
    { id: 'rishabam', name: 'ரிஷபம்', rasiNo: 2, gridPos: '1 / 3', planets: [] },
    { id: 'mithunam', name: 'மிதுனம்', rasiNo: 3, gridPos: '1 / 4', planets: [] },
    { id: 'katakam', name: 'கடகம்', rasiNo: 4, gridPos: '2 / 4', planets: [] },
    { id: 'simmam', name: 'சிம்மம்', rasiNo: 5, gridPos: '3 / 4', planets: [] },
    { id: 'kanni', name: 'கன்னி', rasiNo: 6, gridPos: '4 / 4', planets: [] },
    { id: 'thulam', name: 'துலாம்', rasiNo: 7, gridPos: '4 / 3', planets: [] },
    { id: 'vrichikam', name: 'விருச்சிகம்', rasiNo: 8, gridPos: '4 / 2', planets: [] },
    { id: 'dhanusu', name: 'தனுசு', rasiNo: 9, gridPos: '4 / 1', planets: [] },
    { id: 'makaram', name: 'மகரம்', rasiNo: 10, gridPos: '3 / 1', planets: [] },
    { id: 'kumbam', name: 'கும்பம்', rasiNo: 11, gridPos: '2 / 1', planets: [] }
  ];

  // 3. Evaluation & Submissions State
  submissions: any[] = [];
  isLoadingSubmissions = false;
  selectedSubmissionForGrading: any = null;
  gradingForm = {
    mcq_score: 0,
    practical_score: 0,
    score: 0,
    status: 'Approved',
    evaluator_notes: '',
    is_published: true
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

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
    if (!this.selectedBatchId) {
      return this.submissions;
    }
    return this.submissions.filter(s => String(s.batch_id) === String(this.selectedBatchId));
  }

  get totalExamsCount(): number {
    return this.exams.length;
  }

  get totalSubmissionsCount(): number {
    return this.filteredSubmissions.length;
  }

  get passedSubmissionsCount(): number {
    return this.filteredSubmissions.filter(s => s.status === 'Approved' || (s.score !== null && s.score >= 40)).length;
  }

  get pendingEvaluationCount(): number {
    return this.filteredSubmissions.filter(s => s.score === null || s.status === 'Pending' || !s.status).length;
  }

  get passRatePercentage(): number {
    if (this.totalSubmissionsCount === 0) return 0;
    return Math.round((this.passedSubmissionsCount / this.totalSubmissionsCount) * 100);
  }

  get averageScore(): number {
    const list = this.filteredSubmissions.filter(s => s.score !== null && s.score !== undefined);
    if (list.length === 0) return 0;
    const total = list.reduce((acc, s) => acc + (Number(s.score) || 0), 0);
    return Math.round(total / list.length);
  }

  // --- DYNAMIC LEADERBOARD ---
  get leaderboard(): any[] {
    const list = this.filteredSubmissions
      .filter(s => s.score !== null && s.score !== undefined)
      .map(s => {
        const score = Number(s.score) || 0;
        return {
          ...s,
          score,
          percentage: Math.min(100, Math.round(score)),
          mcqScoreDisplay: s.mcq_score !== null && s.mcq_score !== undefined ? s.mcq_score : Math.round(score * 0.45),
          practicalScoreDisplay: s.practical_score !== null && s.practical_score !== undefined ? s.practical_score : Math.round(score * 0.55)
        };
      })
      .sort((a, b) => b.score - a.score);

    return list.map((item, idx) => {
      let badge = `${idx + 1}`;
      if (idx === 0) badge = '🥇 1';
      else if (idx === 1) badge = '🥈 2';
      else if (idx === 2) badge = '🥉 3';
      return { ...item, rank: idx + 1, rankBadge: badge };
    });
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
        this.cdr.markForCheck();
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

  // --- DYNAMIC RASI CHART BUILDER & PARSER ---
  selectPlanetTool(planet: string): void {
    this.selectedPlanetTool = planet;
  }

  togglePlanetInHouse(house: ChartHouse): void {
    if (!this.selectedPlanetTool) return;

    const idx = house.planets.indexOf(this.selectedPlanetTool);
    if (idx > -1) {
      house.planets.splice(idx, 1);
    } else {
      house.planets.push(this.selectedPlanetTool);
    }
    this.syncChartToExamPrompt();
    this.cdr.markForCheck();
  }

  clearHousePlanets(house: ChartHouse, event: Event): void {
    event.stopPropagation();
    house.planets = [];
    this.syncChartToExamPrompt();
    this.cdr.markForCheck();
  }

  resetAllChartHouses(): void {
    this.chartHouses.forEach(h => h.planets = []);
    this.syncChartToExamPrompt();
    this.cdr.markForCheck();
  }

  loadChartPreset(presetKey: string): void {
    this.resetAllChartHouses();

    if (presetKey === 'gajakesari') {
      const mesham = this.chartHouses.find(h => h.id === 'mesham');
      const katakam = this.chartHouses.find(h => h.id === 'katakam');
      const simmam = this.chartHouses.find(h => h.id === 'simmam');
      if (mesham) mesham.planets = ['லக்', 'சந்'];
      if (katakam) katakam.planets = ['குரு'];
      if (simmam) simmam.planets = ['சூரி', 'புத'];
    } else if (presetKey === 'malavya') {
      const rishabam = this.chartHouses.find(h => h.id === 'rishabam');
      const makaram = this.chartHouses.find(h => h.id === 'makaram');
      const dhanusu = this.chartHouses.find(h => h.id === 'dhanusu');
      if (rishabam) rishabam.planets = ['லக்', 'சுக்'];
      if (makaram) makaram.planets = ['சனி'];
      if (dhanusu) dhanusu.planets = ['குரு', 'கேது'];
    } else if (presetKey === 'surya_atchi') {
      const simmam = this.chartHouses.find(h => h.id === 'simmam');
      const kanni = this.chartHouses.find(h => h.id === 'kanni');
      const katakam = this.chartHouses.find(h => h.id === 'katakam');
      if (simmam) simmam.planets = ['லக்', 'சூரி'];
      if (kanni) kanni.planets = ['புத'];
      if (katakam) katakam.planets = ['சந்', 'சுக்'];
    }
    this.syncChartToExamPrompt();
    this.cdr.markForCheck();
  }

  syncChartToExamPrompt(): void {
    if (!this.activeExamWizard) return;

    const placedHouses = this.chartHouses
      .filter(h => h.planets.length > 0)
      .map(h => `${h.name}: [${h.planets.join(', ')}]`);

    if (placedHouses.length > 0) {
      this.activeExamWizard.practical_prompt =
        `கொடுக்கப்பட்டுள்ள ராசி கட்டக் கிரக நிலைகள்:\n` +
        placedHouses.join(' | ') +
        `\n\nவினா: மேற்கண்ட ஜாதகக் கட்டத்தை ஆராய்ந்து லக்னாதிபதி பலம், யோகங்கள் மற்றும் 7-ம் பாவ பலன்களை விவரிக்கவும்.`;
    }
  }

  parsePromptToChartHouses(promptText: string): void {
    this.resetAllChartHouses();
    if (!promptText) return;

    this.chartHouses.forEach(h => {
      const regex = new RegExp(`${h.name}:\\s*\\[([^\\]]+)\\]`, 'u');
      const match = promptText.match(regex);
      if (match && match[1]) {
        h.planets = match[1].split(',').map(p => p.trim()).filter(Boolean);
      }
    });
  }

  setChartMode(mode: 'interactive' | 'upload'): void {
    this.chartMode = mode;
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
        this.cdr.markForCheck();
      },
      error: () => {
        this.isUploadingChart = false;
        alert('படம் பதிவேற்றுவதில் பிழை ஏற்பட்டது.');
        this.cdr.markForCheck();
      }
    });
  }

  removeUploadedChart(): void {
    if (this.activeExamWizard) {
      this.activeExamWizard.chart_image_url = '';
      this.cdr.markForCheck();
    }
  }

  // --- EXAM WIZARD ACTIONS ---
  openCreateExam(): void {
    this.resetAllChartHouses();
    this.chartMode = 'interactive';
    this.activeExamWizard = {
      id: null,
      level: this.selectedCategory,
      title: '',
      duration: 60,
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
    this.chartMode = exam.chart_image_url ? 'upload' : 'interactive';
    this.activeExamWizard = {
      ...exam,
      pass_percentage: exam.pass_percentage || 50
    };
    if (!this.activeExamWizard.questions) this.activeExamWizard.questions = [];
    
    // Dynamically reconstruct chart from prompt
    this.parsePromptToChartHouses(exam.practical_prompt || '');
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

    const request$ = isEdit
      ? this.http.put<any>(url, payload, headers)
      : this.http.post<any>(url, payload, headers);

    request$.subscribe({
      next: (res: any) => {
        alert(res?.message || 'தேர்வு வெற்றிகரமாக சேமிக்கப்பட்டது!');
        if (!isEdit && res?.exam_id) {
          this.activeExamWizard.id = res.exam_id;
        }
        this.loadExams();
      },
      error: (err) => alert(err?.error?.message || 'தேர்வை சேமிப்பதில் பிழை ஏற்பட்டது.')
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
      alert(e?.error?.message || 'தேர்வை சேமிப்பதில் பிழை ஏற்பட்டது.');
      return false;
    }
    return false;
  }

  async addQuestion(): Promise<void> {
    if (!this.newQuestion.question_text.trim()) {
      alert('தயவுசெய்து வினாவின் கேள்வியை உள்ளிடவும்.');
      return;
    }

    const filledOptions = this.newQuestion.optionsList
      .map(o => o.text.trim())
      .filter(t => t.length > 0);

    if (filledOptions.length < 2) {
      alert('குறைந்தது 2 விருப்பங்களுக்கு (Options) விடையை உள்ளிடவும்.');
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
        this.cdr.markForCheck();
      },
      error: () => alert('வினாவை சேர்ப்பதில் பிழை.')
    });
  }

  addDynamicOption(): void {
    if (this.newQuestion.optionsList.length >= 8) {
      alert('அதிகபட்சம் 8 விருப்பங்கள் மட்டுமே சேர்க்க முடியும்.');
      return;
    }
    this.newQuestion.optionsList.push({ text: '', is_correct: false });
  }

  removeDynamicOption(index: number): void {
    if (this.newQuestion.optionsList.length <= 2) {
      alert('குறைந்தது 2 விருப்பங்கள் (Options) இருக்க வேண்டும்.');
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
        this.cdr.markForCheck();
      },
      error: () => alert('வினாவை நீக்குவதில் பிழை.')
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
      alert('தயவுசெய்து CSV கோப்பை தேர்வு செய்யவும்.');
      return;
    }
    const saved = await this.ensureExamSaved();
    if (!saved || !this.activeExamWizard.id) return;

    const formData = new FormData();
    formData.append('file', this.csvFileToUpload);
    const headers = this.authService.getUploadHeaders();
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
    const mcq = sub.mcq_score !== null && sub.mcq_score !== undefined ? Number(sub.mcq_score) : 40;
    const prac = sub.practical_score !== null && sub.practical_score !== undefined ? Number(sub.practical_score) : 45;
    const tot = sub.score !== null && sub.score !== undefined ? Number(sub.score) : (mcq + prac);

    this.gradingForm = {
      mcq_score: mcq,
      practical_score: prac,
      score: tot,
      status: sub.status === 'Approved' ? 'Approved' : (tot >= 40 ? 'Approved' : 'Rejected'),
      evaluator_notes: sub.evaluator_notes || 'ஜாதகக் கணிப்பு மதிப்பீடு செய்யப்பட்டது. தேர்ச்சி பெற்றார்.',
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

  issueCertificateForStudent(sub: any): void {
    if (!confirm(`${sub.student_name} அவர்களுக்கு டிஜிட்டல் சான்றிதழ் உருவாக்க விரும்புகிறீர்களா?`)) return;

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
        alert(res.message || `சான்றிதழ் வெற்றிகரமாக உருவாக்கப்பட்டது! எண்: ${res.certificate?.certificate_number || 'ASTRO-CERT'}`);
        this.loadSubmissions();
      },
      error: () => alert('சான்றிதழ் உருவாக்குவதில் பிழை.')
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
