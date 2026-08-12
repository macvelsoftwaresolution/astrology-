import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';

export interface Chapter {
  title: string;
  progress: number;
  completed: boolean;
  lessons: {
    title: string;
    duration: string;
    completed: boolean;
    audioUrl?: string;
    videoUrl?: string;
  }[];
  isOpen?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  bought: boolean;
}

export interface Seminar {
  title: string;
  speaker: string;
  date: string;
  time: string;
  status: 'live' | 'upcoming' | 'past';
}

@Component({
  selector: 'app-learn',
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss'],
  standalone: false
})
export class LearnPage implements OnInit {
  currentScreen: 'intro' | 'rules' | 'enroll' | 'payment' | 'dashboard' = 'intro';
  activeQuiz: boolean = false;
  showCertificate: boolean = false;

  // Shared form state
  enrollForm = {
    fullName: '',
    dob: '',
    tob: '',
    pob: '',
    qualification: '',
    reason: ''
  };

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    const enrolled = localStorage.getItem('astro_course_enrolled');
    if (enrolled) {
      this.currentScreen = 'dashboard';
    }

    App.addListener('backButton', () => {
      this.ngZone.run(() => {
        // Only run back button handler if we are active on the learn page route
        if (this.router.url !== '/learn') {
          return;
        }

        if (this.activeQuiz) {
          this.activeQuiz = false;
        } else if (this.showCertificate) {
          this.showCertificate = false;
        } else {
          this.handleBack();
        }
      });
    });
  }

  getHeaderTitle(): string {
    if (this.activeQuiz) {
      return 'பயிற்சித் தேர்வு';
    }
    if (this.showCertificate) {
      return 'சாதனைச் சான்றிதழ்';
    }
    switch (this.currentScreen) {
      case 'intro':
        return 'வேத ஜோதிடக் கல்வி';
      case 'rules':
        return 'விதிமுறைகள்';
      case 'enroll':
        return 'மாணவர் சேர்க்கை';
      case 'payment':
        return 'கட்டணம் செலுத்துதல்';
      case 'dashboard':
        return 'வேத ஜோதிடக் கல்வி';
      default:
        return 'வேத ஜோதிடக் கல்வி';
    }
  }

  handleBack() {
    if (this.activeQuiz) {
      this.activeQuiz = false;
    } else if (this.showCertificate) {
      this.showCertificate = false;
    } else if (this.currentScreen === 'intro') {
      this.router.navigate(['/welcome']);
    } else if (this.currentScreen === 'rules') {
      this.currentScreen = 'intro';
    } else if (this.currentScreen === 'enroll') {
      this.currentScreen = 'rules';
    } else if (this.currentScreen === 'payment') {
      this.currentScreen = 'enroll';
    } else if (this.currentScreen === 'dashboard') {
      this.router.navigate(['/welcome']);
    }
  }

  goToRules() {
    this.currentScreen = 'rules';
  }

  agreeAndContinue() {
    this.currentScreen = 'enroll';
  }

  submitEnrollment(formData: any) {
    this.enrollForm = { ...this.enrollForm, ...formData };
    this.currentScreen = 'payment';
  }

  payAndStart() {
    localStorage.setItem('astro_course_enrolled', 'true');
    this.currentScreen = 'dashboard';
  }

  logoutCourse() {
    localStorage.removeItem('astro_course_enrolled');
    this.currentScreen = 'intro';
    this.router.navigate(['/welcome']);
  }
}
