import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-learn-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  standalone: false
})
export class LearnQuizComponent {
  @Output() close = new EventEmitter<void>();

  quizSubmitted: boolean = false;
  currentQuestionIndex: number = 0;
  selectedOption: string | null = null;
  quizScore: number = 0;
  quizPassed: boolean = false;
  correctAnswersCount: number = 0;

  quizQuestions = [
    {
      question: 'சூரியன் மேஷ ராசியில் உச்சம் பெறும் போது அதன் ஆதிக்கம் எந்த பாவத்தில் வலுவாக இருக்கும்?',
      options: [
        { code: 'A', text: 'லக்ன பாவம் (முதல் வீடு)' },
        { code: 'B', text: 'பத்தாம் பாவம் (தொழில் ஸ்தானம்)' },
        { code: 'C', text: 'ஐந்தாம் பாவம் (பூர்வ புண்ணியம்)' },
        { code: 'D', text: 'ஏழாம் பாவம் (களத்திர ஸ்தானம்)' }
      ],
      answer: 'A'
    },
    {
      question: 'ஒன்பது கோள்களில் மிக மெதுவாக நகரும் கோள் எது?',
      options: [
        { code: 'A', text: 'செவ்வாய்' },
        { code: 'B', text: 'சனி' },
        { code: 'C', text: 'புதன்' },
        { code: 'D', text: 'வியாழன்' }
      ],
      answer: 'B'
    },
    {
      question: 'ஜோதிடத்தில் மொத்தம் எத்தனை ராசிகள் உள்ளன?',
      options: [
        { code: 'A', text: '9' },
        { code: 'B', text: '27' },
        { code: 'C', text: '12' },
        { code: 'D', text: '108' }
      ],
      answer: 'C'
    },
    {
      question: 'பஞ்சாங்கத்தில் காலத்தைக் குறிக்கும் ஐந்து உறுப்புகள் எவை?',
      options: [
        { code: 'A', text: 'நிலம், நீர், நெருப்பு, காற்று, ஆகாயம்' },
        { code: 'B', text: 'வாரம், திதி, நட்சத்திரம், யோகம், கரணம்' },
        { code: 'C', text: 'சூரியன், சந்திரன், செவ்வாய், புதன், குரு' },
        { code: 'D', text: 'மேஷம், ரிஷபம், மிதுனம், கடகம், சிம்மம்' }
      ],
      answer: 'B'
    },
    {
      question: 'களத்திர காரகன் என்று அழைக்கப்படும் கோள் எது?',
      options: [
        { code: 'A', text: 'சுக்கிரன்' },
        { code: 'B', text: 'செவ்வாய்' },
        { code: 'C', text: 'சந்திரன்' },
        { code: 'D', text: 'சூரியன்' }
      ],
      answer: 'A'
    },
    {
      question: 'குரு பகவானின் ஆதிக்கத்திற்குரிய சிறந்த ராசி எது?',
      options: [
        { code: 'A', text: 'மேஷம்' },
        { code: 'B', text: 'தனுசு' },
        { code: 'C', text: 'ரிஷபம்' },
        { code: 'D', text: 'மிதுனம்' }
      ],
      answer: 'B'
    }
  ];

  selectOption(optCode: string) {
    this.selectedOption = optCode;
  }

  submitAnswer() {
    if (!this.selectedOption) return;

    if (this.selectedOption === this.quizQuestions[this.currentQuestionIndex].answer) {
      this.correctAnswersCount++;
    }

    if (this.currentQuestionIndex < this.quizQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedOption = null;
    } else {
      this.quizScore = Math.round((this.correctAnswersCount / this.quizQuestions.length) * 100);
      this.quizSubmitted = true;
      this.quizPassed = this.quizScore >= 60; // Pass mark set to 60%
    }
  }
}
