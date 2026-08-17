import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AuthService } from '../../services/auth.service';

import { BackButtonService } from '../../services/back-button.service';

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
    private authService: AuthService,
    private backButtonService: BackButtonService
  ) { }

  ngOnInit() {
    const enrolled = localStorage.getItem('astro_course_enrolled');
    const loggedIn = this.authService.isLoggedIn('education');
    if (enrolled && loggedIn) {
      this.currentScreen = 'dashboard';
    } else {
      this.currentScreen = 'intro';
    }
  }

  ionViewDidEnter() {
    this.backButtonService.registerHandler(this.customBackHandler);
  }

  ionViewWillLeave() {
    this.backButtonService.unregisterHandler(this.customBackHandler);
  }

  ngOnDestroy() {
    this.backButtonService.unregisterHandler(this.customBackHandler);
  }

  customBackHandler = () => {
    if (this.activeQuiz) {
      this.activeQuiz = false;
      return true;
    }
    if (this.showCertificate) {
      this.showCertificate = false;
      return true;
    }
    if (this.currentScreen === 'intro') {
      return false;
    }
    this.handleBack();
    return true;
  };

  ionViewWillEnter() {
    const enrolled = localStorage.getItem('astro_course_enrolled');
    const loggedIn = this.authService.isLoggedIn('education');
    if (enrolled && loggedIn) {
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
    // Generate credentials
    const randomId = Math.floor(1000 + Math.random() * 9000);
    this.generatedLoginId = `EDU-${randomId}`;
    this.generatedPassword = '654321'; // Set static password for ease of test

    // Register user account dynamically in auth service
    const newUser = {
      fullName: this.enrollForm.fullName || 'கல்வி பயனர்',
      mobileNumber: this.generatedLoginId,
      emailAddress: 'education@example.com',
      password: this.generatedPassword
    };
    this.authService.register(newUser, 'education');
    // Save enrollment state
    localStorage.setItem('astro_course_enrolled', 'true');
    // Transition to post payment login screen
    this.currentScreen = 'post-payment-login';
  }

  loginToCourse() {
    if (!this.loginIdInput || !this.loginPasswordInput) {
      this.loginErrorMessage = 'அனைத்து விவரங்களையும் உள்ளிடவும்.';
      return;
    }

    const success = this.authService.login(this.loginIdInput, this.loginPasswordInput, 'education');
    if (success) {
      this.loginErrorMessage = '';
      this.currentScreen = 'dashboard';
    } else {
      this.loginErrorMessage = 'தவறான பயனர் ஐடி அல்லது கடவுச்சொல்.';
    }
  }

  logoutCourse() {
    this.authService.logout('education');
    localStorage.removeItem('astro_course_enrolled');
    this.currentScreen = 'intro';
    this.router.navigate(['/welcome']);
  }

  getHeaderTitle(): string {
    switch (this.currentScreen) {
      case 'intro': return 'அறிமுகம்';
      case 'rules': return 'விதிமுறைகள்';
      case 'enroll': return 'சேர்க்கை படிவம்';
      case 'payment': return 'கட்டணம்';
      case 'post-payment-login': return 'உள்நுழைவு';
      case 'dashboard': return 'ஆருத்ரா';
      default: return 'ஆருத்ரா';
    }
  }
}
