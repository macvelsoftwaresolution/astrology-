import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-learn-quiz',
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.scss'],
  standalone: false
})
export class LearnQuizComponent implements OnInit, OnDestroy {
  @Input() exam: any;
  @Output() close = new EventEmitter<void>();

  quizSubmitted: boolean = false;
  isPracticalStep: boolean = false;
  currentQuestionIndex: number = 0;
  selectedOption: string | null = null;
  fillupAnswer: string = '';
  
  // Practical Handwritten Answer Sheet Upload State
  uploadedAnswerUrl: string = '';
  uploadedFileName: string = '';
  uploadedFileType: string = ''; // 'image' | 'pdf'
  isUploadingAnswerSheet: boolean = false;
  uploadErrorMessage: string = '';
  isSubmittingPractical: boolean = false;
  
  quizScore: number = 0;
  quizPassed: boolean = false;
  correctAnswersCount: number = 0;
  
  quizQuestions: any[] = [];
  
  timeRemaining: number = 0;
  timerInterval: any;
  timerDisplay: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  hasPracticalSection(): boolean {
    return !!(this.exam && (this.exam.chart_image_url || this.exam.practical_prompt));
  }

  ngOnInit() {
    if (this.exam && this.exam.questions) {
      this.quizQuestions = this.exam.questions.map((q: any) => ({
        id: q.id,
        type: q.type || 'mcq',
        question: q.question_text,
        options: q.options || [],
        answer: q.correct_answer,
        marks: q.marks || 1
      }));
    }

    if (this.quizQuestions.length === 0 && this.hasPracticalSection()) {
      this.isPracticalStep = true;
    }

    if (this.exam && this.exam.duration) {
      this.timeRemaining = this.exam.duration * 60;
      this.updateTimerDisplay();
      this.startTimer();
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      
      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.autoSubmitQuiz();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    this.timerDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  handleQuizClose() {
    if (!this.quizSubmitted) {
      if (confirm('தேர்வை இடையில் நிறுத்தினால் அது முடிவுற்றதாகவே (Completed) கருதப்படும். மீண்டும் எழுத இயலாது.\nவெளியேற விரும்புகிறீர்களா? (If you close now, your exam will be auto-submitted and cannot be retaken. Are you sure?)')) {
        this.autoSubmitOnExit();
      }
    } else {
      this.close.emit();
    }
  }

  autoSubmitOnExit() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    const totalMarks = this.quizQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
    const mcqScore = totalMarks > 0 ? Math.round((this.correctAnswersCount / totalMarks) * 100) : 0;
    this.quizScore = mcqScore;
    this.quizSubmitted = true;
    this.quizPassed = this.quizScore >= (this.exam?.pass_mark || 60);

    if (this.authService.isLoggedIn()) {
      const payload = {
        course_id: this.exam?.course_id || null,
        exam_id: this.exam?.id || null,
        submission_type: this.uploadedAnswerUrl ? (this.uploadedFileType === 'pdf' ? 'pdf_upload' : 'practical_assignment') : 'online_quiz',
        pdf_url: this.uploadedAnswerUrl || null,
        score: this.quizScore,
        mcq_score: mcqScore,
        practical_score: null,
        notes: this.uploadedAnswerUrl ? 'Handwritten Answer Sheet Uploaded' : 'Student exited mid-exam (Auto-submitted)'
      };

      this.http.post<any>(`${environment.apiUrl}/user/submissions`, payload, this.authService.getAuthHeaders()).subscribe({
        next: () => {
          this.close.emit();
        },
        error: () => {
          this.close.emit();
        }
      });
    } else {
      this.close.emit();
    }
  }

  autoSubmitQuiz() {
    if ((this.selectedOption && this.quizQuestions[this.currentQuestionIndex].type === 'mcq') || 
        (this.fillupAnswer.trim() && this.quizQuestions[this.currentQuestionIndex].type === 'fillup')) {
       const currentQ = this.quizQuestions[this.currentQuestionIndex];
       let isCorrect = false;
       if (currentQ.type === 'mcq') {
         isCorrect = this.selectedOption === currentQ.answer;
       } else if (currentQ.type === 'fillup') {
         isCorrect = this.fillupAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase();
       }
       if (isCorrect) {
         this.correctAnswersCount += currentQ.marks;
       }
    }
    this.finishQuiz();
  }

  selectOption(opt: string) {
    this.selectedOption = opt;
  }

  submitAnswer() {
    const currentQ = this.quizQuestions[this.currentQuestionIndex];
    let isCorrect = false;

    if (currentQ.type === 'mcq') {
      if (!this.selectedOption) return;
      isCorrect = this.selectedOption === currentQ.answer;
    } else if (currentQ.type === 'fillup') {
      if (!this.fillupAnswer.trim()) return;
      isCorrect = this.fillupAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase();
    }

    if (isCorrect) {
      this.correctAnswersCount += currentQ.marks;
    }

    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedOption = null;
      this.fillupAnswer = '';
    } else if (this.hasPracticalSection()) {
      this.isPracticalStep = true;
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    const totalMarks = this.quizQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
    this.quizScore = totalMarks > 0 ? Math.round((this.correctAnswersCount / totalMarks) * 100) : 0;
    this.quizSubmitted = true;
    const passMark = this.exam?.pass_mark || 60;
    this.quizPassed = this.quizScore >= passMark;

    if (this.authService.isLoggedIn()) {
      const payload = {
        course_id: this.exam?.course_id || null,
        exam_id: this.exam?.id || null,
        submission_type: 'online_quiz',
        score: this.quizScore,
        mcq_score: this.quizScore,
        practical_score: null
      };
      this.http.post<any>(`${environment.apiUrl}/user/submissions`, payload, this.authService.getAuthHeaders()).subscribe({
        next: () => {},
        error: () => {}
      });
    }
  }

  onAnswerFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    if (!file) return;

    this.uploadErrorMessage = '';
    this.isUploadingAnswerSheet = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'exam_answers');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        this.isUploadingAnswerSheet = false;
        if (res && res.url) {
          this.uploadedAnswerUrl = res.url;
          this.uploadedFileName = file.name;
          this.uploadedFileType = file.type.includes('pdf') ? 'pdf' : 'image';
        } else {
          this.uploadErrorMessage = 'கோப்பை பதிவேற்ற முடியவில்லை.';
        }
      },
      error: (err) => {
        this.isUploadingAnswerSheet = false;
        this.uploadErrorMessage = err?.error?.message || 'கோப்பை பதிவேற்றுவதில் பிழை ஏற்பட்டது.';
      }
    });
  }

  removeUploadedFile() {
    this.uploadedAnswerUrl = '';
    this.uploadedFileName = '';
    this.uploadedFileType = '';
    this.uploadErrorMessage = '';
  }

  submitPracticalExam() {
    if (!this.uploadedAnswerUrl) {
      this.uploadErrorMessage = 'தயவுசெய்து உங்கள் விடைத்தாளை (Image அல்லது PDF) பதிவேற்றவும்.';
      return;
    }

    this.isSubmittingPractical = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const totalMarks = this.quizQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
    const mcqScore = totalMarks > 0 ? Math.round((this.correctAnswersCount / totalMarks) * 100) : null;
    const totalScore = mcqScore !== null ? mcqScore : 100;

    const payload = {
      course_id: this.exam?.course_id || null,
      exam_id: this.exam?.id || null,
      submission_type: this.uploadedFileType === 'pdf' ? 'pdf_upload' : 'practical_assignment',
      pdf_url: this.uploadedAnswerUrl,
      score: totalScore,
      mcq_score: mcqScore,
      practical_score: null, // Practical marks will be given by Admin during evaluation
      notes: 'Handwritten Answer Sheet Uploaded by Student'
    };

    this.http.post<any>(`${environment.apiUrl}/user/submissions`, payload, this.authService.getAuthHeaders()).subscribe({
      next: () => {
        this.isSubmittingPractical = false;
        this.quizSubmitted = true;
        this.quizPassed = true;
        this.quizScore = totalScore;
      },
      error: () => {
        this.isSubmittingPractical = false;
        this.quizSubmitted = true;
        this.quizPassed = true;
        this.quizScore = totalScore;
      }
    });
  }
}
