import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-learn-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  standalone: false
})
export class LearnQuizComponent implements OnInit, OnDestroy {
  @Input() exam: any;
  @Output() close = new EventEmitter<void>();

  quizSubmitted: boolean = false;
  currentQuestionIndex: number = 0;
  selectedOption: string | null = null;
  fillupAnswer: string = '';
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
        score: this.quizScore
      };
      this.http.post<any>(`${environment.apiUrl}/user/submissions`, payload, this.authService.getAuthHeaders()).subscribe({
        next: () => {},
        error: () => {}
      });
    }
  }
}
