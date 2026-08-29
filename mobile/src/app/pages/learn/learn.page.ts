import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonContent } from '@ionic/angular';
import { App } from '@capacitor/app';
import { AuthService } from '../../services/auth.service';
import { BackButtonService } from '../../services/back-button.service';
import { ExitModalService } from '../../services/exit-modal.service';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';
import { LearnDashboardComponent } from './components/dashboard/dashboard';

declare var Razorpay: any;

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
  id?: number | string;
  title: string;
  speaker: string;
  date?: string;
  time?: string;
  date_text?: string;
  time_text?: string;
  status: 'live' | 'upcoming' | 'past';
  join_url?: string;
  level?: string;
}

@Component({
  selector: 'app-learn',
  templateUrl: './learn.page.html',
  styleUrls: ['./learn.page.scss'],
  standalone: false
})
export class LearnPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content?: IonContent;
  @ViewChild(LearnDashboardComponent) dashboardComponent?: LearnDashboardComponent;

  currentScreen: 'intro' | 'rules' | 'enroll' | 'payment' | 'post-payment-login' | 'dashboard' = 'intro';
  activeQuiz: any = null;
  showCertificate: boolean = false;
  isProcessingPayment: boolean = false;

  dashboardTab: 'home' | 'lessons' | 'library' | 'profile' = 'home';
  currentLessonView: 'list' | 'detail' = 'list';
  dashboardOption: string | null = null;
  dashboardOrderNumber: string | null = null;

  // Generated credentials variables
  generatedLoginId = '';
  generatedPassword = '';

  // Form input variables for login screen
  loginIdInput = '';
  loginPasswordInput = '';
  showLoginPassword = false;
  loginErrorMessage = '';

  // Fee settings (Dynamic from Admin)
  ilanilaiFee: number = 2500;
  mudhunilaiFee: number = 3500;

  // Shared form state
  enrollForm = {
    fullName: '',
    emailAddress: '',
    mobileNumber: '',
    dob: '',
    tob: '',
    pob: '',
    qualification: '',
    reason: '',
    courseLevel: 'ilanilai'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private authService: AuthService,
    private backButtonService: BackButtonService,
    private exitModalService: ExitModalService,
    private http: HttpClient,
    public translationService: TranslationService
  ) { }

  ngOnInit() {
    this.loadCourseFees();

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
      this.dashboardOption = params['option'] || null;
      this.dashboardOrderNumber = params['order'] || null;
    });
  }

  loadCourseFees() {
    this.http.get<any>(`${environment.apiUrl}/settings/lms_ilanilai_fee`).subscribe({
      next: (res) => {
        if (res && res.value) {
          this.ilanilaiFee = Number(res.value) || 2500;
        }
      },
      error: () => {}
    });

    this.http.get<any>(`${environment.apiUrl}/settings/lms_mudhunilai_fee`).subscribe({
      next: (res) => {
        if (res && res.value) {
          this.mudhunilaiFee = Number(res.value) || 3500;
        }
      },
      error: () => {}
    });
  }

  getCurrentCourseFee(): number {
    const level = this.enrollForm?.courseLevel?.toLowerCase() || 'ilanilai';
    return (level === 'mudhunilai' || level === 'muthunilai') ? this.mudhunilaiFee : this.ilanilaiFee;
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
      if (this.dashboardComponent && this.dashboardComponent.handleBackClick()) {
        return true;
      }
      this.exitModalService.open();
      return true;
    }
    if (this.currentScreen === 'intro') {
      this.router.navigate(['/welcome']);
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

  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(0);
      this.content.getScrollElement().then(el => {
        if (el) el.scrollTop = 0;
      }).catch(() => {});
    }
    const ionEl = document.querySelector('ion-content.edu-content') as any;
    if (ionEl) {
      if (ionEl.scrollToTop) ionEl.scrollToTop(0);
      if (ionEl.getScrollElement) {
        ionEl.getScrollElement().then((el: HTMLElement) => {
          if (el) el.scrollTop = 0;
        }).catch(() => {});
      }
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    setTimeout(() => {
      if (this.content) {
        this.content.scrollToTop(0);
        this.content.getScrollElement().then(el => {
          if (el) el.scrollTop = 0;
        }).catch(() => {});
      }
      if (ionEl?.getScrollElement) {
        ionEl.getScrollElement().then((el: HTMLElement) => {
          if (el) el.scrollTop = 0;
        }).catch(() => {});
      }
      window.scrollTo(0, 0);
    }, 40);
  }

  handleBack() {
    if (this.currentScreen === 'intro') {
      this.router.navigate(['/welcome']);
    } else if (this.currentScreen === 'rules') {
      this.currentScreen = 'intro';
      this.scrollToTop();
    } else if (this.currentScreen === 'enroll') {
      this.currentScreen = 'rules';
      this.scrollToTop();
    } else if (this.currentScreen === 'payment') {
      this.currentScreen = 'enroll';
      this.scrollToTop();
    } else if (this.currentScreen === 'post-payment-login') {
      this.currentScreen = 'intro';
      this.scrollToTop();
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
    this.scrollToTop();
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
    this.scrollToTop();
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
    this.scrollToTop();
  }

  goToLogin() {
    this.generatedLoginId = '';
    this.generatedPassword = '';
    this.loginIdInput = '';
    this.loginPasswordInput = '';
    this.loginErrorMessage = '';
    this.currentScreen = 'post-payment-login';
    this.scrollToTop();
  }

  agreeAndContinue() {
    this.currentScreen = 'enroll';
    this.scrollToTop();
  }

  submitEnrollment(formData: any) {
    this.enrollForm = { ...this.enrollForm, ...formData };
    this.currentScreen = 'payment';
    this.scrollToTop();
  }

  payAndStart() {
    if (this.isProcessingPayment) return;
    this.isProcessingPayment = true;

    const amount = this.getCurrentCourseFee();

    // 1. Create Razorpay order via backend API
    this.http.post<any>(`${environment.apiUrl}/payments/create-order`, { amount }).subscribe({
      next: (orderRes) => {
        if (orderRes && orderRes.success && typeof Razorpay !== 'undefined' && orderRes.key_id) {
          if (orderRes.is_demo) {
            // Demo order mode (when no live/test Razorpay keys present in backend .env)
            this.handlePaymentSuccess('order_demo', 'payment_demo');
            return;
          }

          const options = {
            key: orderRes.key_id,
            amount: (orderRes.amount || amount) * 100,
            currency: orderRes.currency || 'INR',
            name: 'ஆருத்ரா ஜோதிட பயிலரங்கம்',
            description: 'Vedic Astrology Course Fee',
            order_id: orderRes.order_id,
            prefill: {
              name: this.enrollForm.fullName || 'மாணவர்',
              email: this.enrollForm.emailAddress || '',
              contact: this.enrollForm.mobileNumber || ''
            },
            theme: {
              color: '#4A0E17'
            },
            handler: (response: any) => {
              this.ngZone.run(() => {
                this.handlePaymentSuccess(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
              });
            },
            modal: {
              ondismiss: () => {
                this.ngZone.run(() => {
                  this.isProcessingPayment = false;
                });
              }
            }
          };

          try {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
              this.ngZone.run(() => {
                this.isProcessingPayment = false;
                alert('கட்டணம் செலுத்துவதில் பிழை: ' + (resp.error?.description || 'தோல்வியடைந்தது'));
              });
            });
            rzp.open();
          } catch (e: any) {
            this.isProcessingPayment = false;
            alert('Razorpay popup பிழை: ' + (e?.message || e));
          }
        } else {
          alert('கட்டணம் செலுத்துவதற்கான ஆர்டரை உருவாக்குவதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
        }
      },
      error: (err) => {
        this.isProcessingPayment = false;
        console.error('Razorpay order creation error:', err);
        alert(err.error?.message || 'கட்டண சேவைக்கான ஆர்டரை உருவாக்க முடியவில்லை.');
      }
    });
  }

  handlePaymentSuccess(razorpayOrderId?: string, razorpayPaymentId?: string, razorpaySignature?: string) {
    this.isProcessingPayment = true;

    const payload = {
      ...this.enrollForm,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    };

    this.authService.studentRegister(payload).subscribe({
      next: (res) => {
        this.isProcessingPayment = false;
        if (res && res.success) {
          this.generatedLoginId = res.login_id || res.email;
          this.generatedPassword = res.password;
          this.loginIdInput = '';
          this.loginPasswordInput = '';
          this.loginErrorMessage = '';
          this.currentScreen = 'post-payment-login';
        } else {
          alert(res?.message || 'மாணவர் பதிவு செய்வதில் பிழை ஏற்பட்டது.');
        }
      },
      error: (err) => {
        this.isProcessingPayment = false;
        console.error('Student registration API error:', err);
        alert(err.error?.message || 'மாணவர் பதிவு செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
      }
    });
  }

  toggleShowLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  loginToCourse() {
    if (!this.loginIdInput || !this.loginPasswordInput) {
      this.loginErrorMessage = 'errors.fillStudentCreds';
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
