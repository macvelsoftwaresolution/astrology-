import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { App } from '@capacitor/app';
import { AuthService } from '../../services/auth.service';
import { BackButtonService } from '../../services/back-button.service';
import { ExitModalService } from '../../services/exit-modal.service';

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
    description?: string;
    type?: string;
    url?: string;
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
  order?: any;
}

export interface Seminar {
  title: string;
  speaker: string;
  date: string;
  time: string;
  status: 'live' | 'upcoming' | 'past';
  join_url?: string;
}

@Component({
  selector: 'app-learn',
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss'],
  standalone: false
})
export class LearnPage implements OnInit {
  currentScreen: 'intro' | 'rules' | 'enroll' | 'payment' | 'post-payment-login' | 'dashboard' = 'intro';
  activeQuiz: any = null;
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
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private authService: AuthService,
    private backButtonService: BackButtonService,
    private exitModalService: ExitModalService
  ) { }

  ngOnInit() {
    const loggedIn = this.authService.isLoggedIn('education');
    if (loggedIn) {
      this.currentScreen = 'dashboard';
    } else {
      this.currentScreen = 'intro';
    }

    this.route.queryParams.subscribe((params: Params) => {
      if (params['tab'] && ['home', 'lessons', 'library', 'profile'].includes(params['tab'])) {
        this.dashboardTab = params['tab'];
      } else {
        this.dashboardTab = 'home';
      }
      if (params['view'] && ['list', 'detail'].includes(params['view'])) {
        this.currentLessonView = params['view'];
      } else {
        this.currentLessonView = 'list';
      }
    });
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
      this.activeQuiz = null;
      return true;
    }
    if (this.showCertificate) {
      this.showCertificate = false;
      return true;
    }
    if (this.currentScreen === 'dashboard') {
      if (this.currentLessonView === 'detail') {
        this.onLessonViewChange('list');
        return true;
      }
      if (this.dashboardTab !== 'home') {
        this.onDashboardTabChange('home');
        return true;
      }
      this.exitModalService.open();
      return true;
    }
    if (this.currentScreen === 'intro') {
      this.exitModalService.open();
      return true;
    }
    this.handleBack();
    return true;
  };

  ionViewWillEnter() {
    const loggedIn = this.authService.isLoggedIn('education');
    if (loggedIn) {
      this.currentScreen = 'dashboard';
    } else {
      this.currentScreen = 'intro';
    }
  }

  handleBack() {
    if (this.currentScreen === 'intro') {
      this.exitModalService.open();
    } else if (this.currentScreen === 'rules') {
      this.currentScreen = 'intro';
    } else if (this.currentScreen === 'enroll') {
      this.currentScreen = 'rules';
    } else if (this.currentScreen === 'payment') {
      this.currentScreen = 'enroll';
    } else if (this.currentScreen === 'post-payment-login') {
      this.currentScreen = 'intro';
    } else if (this.currentScreen === 'dashboard') {
      this.handleDashboardBack();
    }
  }

  handleDashboardBack() {
    if (this.currentLessonView === 'detail') {
      this.onLessonViewChange('list');
    } else if (this.dashboardTab !== 'home') {
      this.onDashboardTabChange('home');
    } else {
      this.exitModalService.open();
    }
  }

  onDashboardTabChange(tab: 'home' | 'lessons' | 'library' | 'profile') {
    this.dashboardTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        tab: tab === 'home' ? null : tab,
        view: this.currentLessonView === 'list' ? null : this.currentLessonView
      },
      queryParamsHandling: 'merge'
    });
  }

  onLessonViewChange(view: 'list' | 'detail') {
    this.currentLessonView = view;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        tab: this.dashboardTab === 'home' ? null : this.dashboardTab,
        view: view === 'list' ? null : view
      },
      queryParamsHandling: 'merge'
    });
  }

  goToRules() {
    this.currentScreen = 'rules';
  }

  goToLogin() {
    this.generatedLoginId = '';
    this.generatedPassword = '';
    this.loginIdInput = '';
    this.loginPasswordInput = '';
    this.loginErrorMessage = '';
    this.currentScreen = 'post-payment-login';
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
      this.loginErrorMessage = 'தயவுசெய்து அனைத்து விவரங்களையும் உள்ளிடவும்.';
      return;
    }

    this.authService.login(this.loginIdInput.trim(), this.loginPasswordInput.trim(), 'education').subscribe({
      next: () => {
        this.loginErrorMessage = '';
        this.currentScreen = 'dashboard';
      },
      error: (err) => {
        this.loginErrorMessage = err?.error?.message || 'தவறான பயனர் ஐடி அல்லது கடவுச்சொல்.';
      }
    });
  }

  logoutCourse() {
    this.authService.logout('education');
    this.currentScreen = 'intro';
    this.router.navigate(['/welcome'], { replaceUrl: true });
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
