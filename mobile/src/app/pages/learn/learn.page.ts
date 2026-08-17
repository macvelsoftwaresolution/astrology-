import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AuthService } from '../../services/auth.service';

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
  currentScreen: 'intro' | 'rules' | 'enroll' | 'payment' | 'post-payment-login' | 'dashboard' = 'intro';
  activeQuiz: boolean = false;
  showCertificate: boolean = false;

  dashboardTab: 'home' | 'lessons' | 'library' | 'profile' = 'home';
  currentLessonView: 'list' | 'detail' = 'list';

  // Generated credentials variables
  generatedLoginId = '';
  generatedPassword = '';

  // Form input variables for login screen
  loginIdInput = '';
  loginPasswordInput = '';
  loginErrorMessage = '';

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
    private ngZone: NgZone,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const loggedIn = this.authService.isLoggedIn('education');
    if (loggedIn) {
      this.currentScreen = 'dashboard';
    } else {
      this.currentScreen = 'intro';
    }

    App.addListener('backButton', () => {
      this.ngZone.run(() => {
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

  ionViewWillEnter() {
    const loggedIn = this.authService.isLoggedIn('education');
    if (loggedIn) {
      this.currentScreen = 'dashboard';
    }
  }

  handleBack() {
    if (this.currentScreen === 'intro') {
      this.router.navigate(['/welcome']);
    } else if (this.currentScreen === 'rules') {
      this.currentScreen = 'intro';
    } else if (this.currentScreen === 'enroll') {
      this.currentScreen = 'rules';
    } else if (this.currentScreen === 'payment') {
      this.currentScreen = 'enroll';
    } else if (this.currentScreen === 'post-payment-login') {
      this.currentScreen = 'payment';
    } else if (this.currentScreen === 'dashboard') {
      if (this.currentLessonView === 'detail') {
        this.currentLessonView = 'list';
      } else if (this.dashboardTab !== 'home') {
        this.dashboardTab = 'home';
      } else {
        this.currentScreen = 'intro';
      }
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
    const randomId = Math.floor(1000 + Math.random() * 9000);
    this.generatedLoginId = `EDU-${randomId}`;
    this.generatedPassword = '654321';

    const newUser = {
      fullName: this.enrollForm.fullName || 'கல்வி பயனர்',
      mobileNumber: this.generatedLoginId,
      emailAddress: `student_${randomId}@gmail.com`,
      password: this.generatedPassword
    };
    this.authService.register(newUser, 'education').subscribe({
      next: () => {
        this.currentScreen = 'post-payment-login';
      },
      error: () => {
        this.currentScreen = 'post-payment-login';
      }
    });
  }

  loginToCourse() {
    if (!this.loginIdInput || !this.loginPasswordInput) {
      this.loginErrorMessage = 'அனைத்து விவரங்களையும் உள்ளிடவும்.';
      return;
    }

    this.authService.login(this.loginIdInput, this.loginPasswordInput, 'education').subscribe({
      next: () => {
        this.loginErrorMessage = '';
        this.currentScreen = 'dashboard';
      },
      error: () => {
        this.loginErrorMessage = 'தவறான பயனர் ஐடி அல்லது கடவுச்சொல்.';
      }
    });
  }

  logoutCourse() {
    this.authService.logout('education');
    this.currentScreen = 'intro';
    this.router.navigate(['/welcome']);
  }

  getHeaderTitle(): string {
    switch (this.currentScreen) {
      case 'intro': return 'ஜோதிட பயிலரங்கம்';
      case 'rules': return 'விதிகள் & நிபந்தனைகள்';
      case 'enroll': return 'மாணவர் சேர்க்கை படிவம்';
      case 'payment': return 'கட்டண விபரம்';
      case 'post-payment-login': return 'உள்நுழைவு மையம்';
      case 'dashboard': return 'ஜோதிடக் கல்விக்கூடம்';
      default: return 'ஜோதிட பயிலரங்கம்';
    }
  }
}
