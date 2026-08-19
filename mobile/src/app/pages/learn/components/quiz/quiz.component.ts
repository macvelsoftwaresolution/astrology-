import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-learn-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  standalone: false
})
export class LearnQuizComponent implements OnInit {
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

  constructor(private http: HttpClient) {}

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
      const totalPossibleMarks = this.quizQuestions.reduce((sum, q) => sum + q.marks, 0);
      this.quizScore = totalPossibleMarks > 0 
        ? Math.round((this.correctAnswersCount / totalPossibleMarks) * 100) 
        : 0;
        
      this.quizSubmitted = true;
      const passMark = this.exam?.pass_mark || 60;
      this.quizPassed = this.quizScore >= passMark;

      // Submit to database API
      const payload = {
        course_id: this.exam?.course_id || 1, // Fallback
        submission_type: 'online_quiz',
        score: this.quizScore
      };
      this.http.post<any>(`${environment.apiUrl}/user/submissions`, payload).subscribe({
        next: () => {},
        error: () => {}
      });
    }
  }
}
