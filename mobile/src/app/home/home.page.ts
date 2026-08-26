import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';
import { App } from '@capacitor/app';
import { IonContent } from '@ionic/angular';
import { RasiPalanComponent } from '../components/rasi-palan/rasi-palan.component';
import { MarriageMatchingComponent } from '../components/marriage-matching/marriage-matching.component';
import { environment } from '../../environments/environment';

interface Order {
  id: string;
  service: string;
  price: number;
  date: string;
  status: 'Pending' | 'Completed';
  details: string;
}

import { BackButtonService } from '../services/back-button.service';
import { ExitModalService } from '../services/exit-modal.service';

declare var Razorpay: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content?: IonContent;
  @ViewChild(RasiPalanComponent) rasiComponent?: RasiPalanComponent;
  @ViewChild(MarriageMatchingComponent) matchingComponent?: MarriageMatchingComponent;

  // Navigation Tabs State
  currentTab: 'home' | 'services' | 'matching' | 'profile' = 'home';

  // Sub-view Screen flow states for consultation workflows
  activeServiceFlow: null | 'horoscope' | 'vastu' | 'ramajayam' | 'srinivasan' | 'rasi-palan' | 'astrologer_consultation' = null;
  serviceStep: number = 1; // 1: Info/List, 2: Form, 3: Payment, 4: Success

  selectedAstrologer: any = null;
  selectedCategory: any = null;

  astrologerBookingForm = {
    name: '',
    phone: '',
    dob: '',
    tob: '',
    pob: '',
    date: '',
    slot: '',
    call_type: 'Phone',
    notes: ''
  };

  // Profile Orders List (Dynamic from DB)
  userOrders: Order[] = [];
  astrologers: any[] = [];
  profileOption: string | null = null;

  get userInitial(): string {
    const user = this.authService.getCurrentUser();
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'A';
  }

  get userProfileImage(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.profileImage || (user as any)?.avatar_url || null;
  }

  // Hero Slider (Dynamic from DB)
  heroBanners: any[] = [];
  currentBannerIndex = 0;
  private sliderInterval: any;

  // 12 Zodiac list
  rasis = [
    { name: 'மேஷம்', english: 'Aries', image: '♈', imagePath: '' },
    { name: 'ரிஷபம்', english: 'Taurus', image: '♉', imagePath: '' },
    { name: 'மிதுனம்', english: 'Gemini', image: '♊', imagePath: '' },
    { name: 'கடகம்', english: 'Cancer', image: '♋', imagePath: '' },
    { name: 'சிம்மம்', english: 'Leo', image: '♌', imagePath: '' },
    { name: 'கன்னி', english: 'Virgo', image: '♍', imagePath: '' },
    { name: 'துலாம்', english: 'Libra', image: '♎', imagePath: '' },
    { name: 'விருச்சிகம்', english: 'Scorpio', image: '♏', imagePath: '' },
    { name: 'தனுசு', english: 'Sagittarius', image: '♐', imagePath: '' },
    { name: 'மகரம்', english: 'Capricorn', image: '♑', imagePath: '' },
    { name: 'கும்பம்', english: 'Aquarius', image: '♒', imagePath: '' },
    { name: 'மீனம்', english: 'Pisces', image: '♓', imagePath: '' }
  ];

  // Today's Panchangam values (Populated directly from Live DB/API)
  panchangam = {
    thithi: '',
    star: '',
    rahukalam: '',
    yamagandam: '',
    nalla_neram: ''
  };

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private backButtonService: BackButtonService,
    private exitModalService: ExitModalService,
    public translationService: TranslationService
  ) { }

  // Navigation History Stack for step-by-step ("line by line") back navigation
  navHistory: Array<{ tab: 'home' | 'services' | 'matching' | 'profile'; flow: any; step: number }> = [
    { tab: 'home', flow: null, step: 1 }
  ];

  ionViewDidEnter() {
    this.backButtonService.registerHandler(this.customBackHandler);
  }

  ionViewWillLeave() {
    this.backButtonService.unregisterHandler(this.customBackHandler);
  }

  ngOnDestroy() {
    this.backButtonService.unregisterHandler(this.customBackHandler);
    this.stopSlider();
  }

  startSlider() {
    this.sliderInterval = setInterval(() => {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.heroBanners.length;
    }, 3000);
  }

  stopSlider() {
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
    }
  }

  setBannerIndex(index: number) {
    this.currentBannerIndex = index;
    this.stopSlider();
    this.startSlider();
  }

  get userName(): string {
    return this.authService.getCurrentUser()?.name || 'பயனர்';
  }

  customBackHandler = () => {
    return this.goBackStep();
  };

  handleOverlayBack() {
    this.goBackStep();
  }

  goBackStep(): boolean {
    // 1. If in Rasi Palan component with detail view open, close detail first
    if (this.activeServiceFlow === 'rasi-palan') {
      if (this.rasiComponent && this.rasiComponent.handleBack()) {
        return true;
      }
      this.closeServiceFlow();
      return true;
    }

    // 2. If in active consultation booking flow (Step 2 Payment -> Step 1 Form, or Step 1 Form -> Profile)
    if (this.activeServiceFlow) {
      if (this.serviceStep > 1 && this.serviceStep !== 3 && this.serviceStep !== 4) {
        this.serviceStep--;
      } else {
        this.activeServiceFlow = null;
        this.serviceStep = 1;
        this.syncQueryParams();
      }
      return true;
    }

    // 3. If on Matching Tab and inside a sub-step, step back inside matching first
    if (this.currentTab === 'matching') {
      if (this.matchingComponent && this.matchingComponent.handleBack()) {
        return true;
      }
    }

    // 4. If in Services tab inside a Selected Category / Astrologer Profile (Level 2 -> Level 1)
    if (this.currentTab === 'services' && this.selectedCategory) {
      this.selectedCategory = null;
      this.selectedAstrologer = null;
      this.syncQueryParams();
      return true;
    }

    // 5. If on Services / Matching / Profile tab (Level 1 -> Home Tab)
    if (this.currentTab !== 'home') {
      this.selectTab('home');
      return true;
    }

    // 5. At Root Home Tab -> Open Exit App Confirmation Dialog
    this.exitModalService.open();
    return true;
  }

  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(0);
      this.content.getScrollElement().then(el => {
        if (el) el.scrollTop = 0;
      }).catch(() => {});
    }
    const ionEl = document.querySelector('ion-content') as any;
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

  private syncQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        tab: this.currentTab === 'home' && !this.activeServiceFlow ? null : this.currentTab, 
        flow: this.activeServiceFlow 
      },
      queryParamsHandling: 'merge'
    });
  }

  getHeaderTitle(): string {
    // 1. Root Home Tab
    if (this.currentTab === 'home' && !this.activeServiceFlow) {
      const user = this.authService.getCurrentUser();
      return user?.name || this.userName || 'பயனர்';
    }

    // 2. Active Service Flows
    if (this.activeServiceFlow === 'astrologer_consultation') {
      return this.selectedCategory ? this.selectedCategory.title : this.translationService.translate('astrology.services', 'ஜோதிட ஆலோசனை');
    }
    if (this.activeServiceFlow === 'rasi-palan') return this.translationService.translate('astrology.rasiPalan', 'இன்றைய ராசி பலன்');

    // 3. Services Tab
    if (this.currentTab === 'services') {
      if (this.selectedCategory) return this.selectedCategory.title;
      return this.translationService.translate('astrology.title', 'ஜோதிட சேவைகள்');
    }

    // 4. Other Tabs
    switch (this.currentTab) {
      case 'matching': return this.translationService.translate('astrology.matching', 'திருமண பொருத்தம்');
      case 'profile': return this.translationService.translate('profile.title', 'சுயவிவரம்');
      default: return this.userName || 'ஆருத்ரா ஜோதிடம்';
    }
  }

  canShowBackButton(): boolean {
    if (this.currentTab === 'home' && !this.activeServiceFlow) {
      return false;
    }
    if (this.activeServiceFlow !== null) return true;
    if (this.currentTab === 'services' && this.selectedCategory !== null) return true;
    if (this.currentTab !== 'home') return true;
    return false;
  }

  unreadNotificationsCount: number = 0;
  latestUnreadNotif: any = null;
  showNotifPopupBanner: boolean = false;
  isHidingBanner: boolean = false;
  private notifTimer: any = null;

  openNotifications() {
    if (this.notifTimer) {
      clearTimeout(this.notifTimer);
      this.notifTimer = null;
    }
    this.showNotifPopupBanner = false;
    this.isHidingBanner = false;
    this.router.navigate(['/notifications'], { queryParams: { from: 'astrology' } });
  }

  closeNotifBanner() {
    if (this.notifTimer) {
      clearTimeout(this.notifTimer);
      this.notifTimer = null;
    }
    this.isHidingBanner = true;
    setTimeout(() => {
      this.showNotifPopupBanner = false;
      this.isHidingBanner = false;
    }, 350);
  }

  private isToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
  }

  loadNotificationsCount() {
    const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('edu_auth_token');
    if (!token) return;
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    this.http.get<any>(`${environment.apiUrl}/user/notifications`, headers).subscribe({
      next: (res) => {
        const astroTypes = ['booking', 'booking_confirmed', 'booking_fulfilled', 'jathagam', 'marriage', 'marriage_match', 'payment', 'transaction', 'rasi_palan', 'general'];
        const astroNotifs = (res.notifications || []).filter((n: any) => astroTypes.includes(n.type));
        this.unreadNotificationsCount = astroNotifs.filter((n: any) => !n.is_read).length;
        if (astroNotifs.length > 0) {
          const unreadList = astroNotifs.filter((n: any) => !n.is_read && this.isToday(n.created_at));
          if (unreadList.length > 0) {
            this.latestUnreadNotif = unreadList[0];
            const dismissKey = 'notif_banner_dismissed_' + unreadList[0].id;
            try {
              if (!localStorage.getItem(dismissKey) && !sessionStorage.getItem(dismissKey)) {
                this.showNotifPopupBanner = true;
                this.isHidingBanner = false;
                localStorage.setItem(dismissKey, 'true');
                sessionStorage.setItem(dismissKey, 'true');

                if (this.notifTimer) clearTimeout(this.notifTimer);
                this.notifTimer = setTimeout(() => {
                  this.closeNotifBanner();
                }, 8000);
              }
            } catch {}
          }
        }
      },
      error: () => {}
    });
  }

  fetchRasiIcons() {
    this.http.get<any>(`${environment.apiUrl}/rasi-icons`).subscribe({
      next: (res) => {
        if (res) {
          this.rasis.forEach(r => {
            if (res[r.name]) {
              r.imagePath = res[r.name];
            }
          });
        }
      },
      error: () => {}
    });
  }

  ngOnInit() {
    this.checkAuth();
    this.startSlider();
    this.loadBanners();
    this.loadPanchangam();
    this.loadAstrologers();
    this.loadUserOrders();
    this.loadNotificationsCount();
    this.fetchRasiIcons();

    this.route.queryParams.subscribe(params => {
      if (params['tab'] && ['home', 'services', 'matching', 'profile'].includes(params['tab'])) {
        this.currentTab = params['tab'];
        if (this.currentTab === 'home') {
          this.selectedCategory = null;
          this.activeServiceFlow = null;
        }
      } else if (!params['tab']) {
        this.currentTab = 'home';
        this.selectedCategory = null;
        this.activeServiceFlow = null;
      }
      if (params['flow']) {
        this.activeServiceFlow = params['flow'];
      } else {
        this.activeServiceFlow = null;
      }
      this.profileOption = params['option'] || null;
    });
  }

  ionViewWillEnter() {
    this.checkAuth();
    this.loadBanners();
    this.loadPanchangam();
    this.loadAstrologers();
    this.loadUserOrders();
    this.loadNotificationsCount();
    this.fetchRasiIcons();
  }

  loadBanners() {
    this.http.get<any>(`${environment.apiUrl}/public/banners`).subscribe({
      next: (res) => {
        if (res && res.banners && Array.isArray(res.banners) && res.banners.length > 0) {
          this.heroBanners = res.banners.map((b: any) => ({
            image: b.image_url || 'assets/images/temple_sunrise.png',
            badge: b.badge || 'ஆன்மீகம்',
            title: b.title,
            subtitle: b.subtitle || '',
            link_flow: b.link_flow || 'services'
          }));
        }
      },
      error: () => {}
    });
  }

  onBannerClick(banner: any) {
    if (!banner) return;
    const flow = banner.link_flow;
    if (flow === 'rasi-palan') {
      this.startServiceFlow('rasi-palan');
    } else if (flow === 'matching') {
      this.selectTab('matching');
    } else {
      this.selectTab('services');
    }
  }

  loadPanchangam() {
    this.http.get<any>(`${environment.apiUrl}/panchangam/today`).subscribe({
      next: (res) => {
        if (res) {
          this.panchangam = {
            thithi: res.thithi || res.panchangam?.thithi || '',
            star: res.star || res.panchangam?.star || '',
            rahukalam: res.rahukalam || res.panchangam?.rahukalam || '',
            yamagandam: res.yamagandam || res.panchangam?.yamagandam || '',
            nalla_neram: res.nalla_neram || res.panchangam?.nalla_neram || ''
          };
        }
      },
      error: () => {}
    });
  }

  loadAstrologers() {
    this.http.get<any>(`${environment.apiUrl}/public/astrologers`).subscribe({
      next: (res) => {
        if (res && res.astrologers && Array.isArray(res.astrologers)) {
          this.astrologers = res.astrologers;
        }
      },
      error: () => {}
    });
  }

  loadUserOrders() {
    const token = sessionStorage.getItem('auth_token');
    if (!token) return;
    this.http.get<any>(`${environment.apiUrl}/user/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        if (res && res.bookings && Array.isArray(res.bookings)) {
          this.userOrders = res.bookings.map((b: any) => {
            let parsedDetails: any = null;
            if (b.details) {
              if (typeof b.details === 'object') {
                parsedDetails = b.details;
              } else {
                try {
                  parsedDetails = JSON.parse(b.details);
                } catch {
                  parsedDetails = { notes: b.details };
                }
              }
            }
            return {
              id: b.id,
              service: b.service_type,
              price: Number(b.price) || 0,
              date: b.created_at ? new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
              status: b.status || 'Pending',
              details: parsedDetails?.notes || (typeof b.details === 'string' && !b.details.startsWith('{') ? b.details : ''),
              parsedDetails: parsedDetails,
              chart_url: b.chart_url || null,
              parigaram: b.parigaram || null
            };
          });
        }
      },
      error: () => {}
    });
  }

  hasBookedService(serviceTitle: string): boolean {
    return this.userOrders.some(o => o.service === serviceTitle);
  }

  private checkAuth() {
    if (!this.authService.isLoggedIn('astrology')) {
      if (this.authService.isLoggedIn('education')) {
        this.router.navigate(['/learn'], { replaceUrl: true });
      } else {
        this.router.navigate(['/welcome'], { replaceUrl: true });
      }
    }
  }

  // Change Navigation tabs
  selectTab(tab: 'home' | 'services' | 'matching' | 'profile') {
    this.currentTab = tab;
    this.activeServiceFlow = null;
    this.selectedCategory = null;
    this.selectedAstrologer = null;
    this.serviceStep = 1;
    this.scrollToTop();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'home' ? null : tab, flow: null },
      queryParamsHandling: 'merge'
    });
  }

  selectServiceCategory(cat: any) {
    this.selectedCategory = cat;
    this.activeServiceFlow = null;
    this.serviceStep = 1;
  }

  get displayCategories(): any[] {
    const categoriesMap = new Map<string, any>();

    // Scan astrologers loaded directly from DB API
    if (this.astrologers && this.astrologers.length > 0) {
      this.astrologers.forEach(astro => {
        const catName = (astro.category || astro.role_title || 'ஜோதிட ஆலோசனை').trim();
        if (!categoriesMap.has(catName)) {
          categoriesMap.set(catName, {
            id: 'cat_' + catName.replace(/\s+/g, '_').toLowerCase(),
            title: catName,
            subtitle: `${catName} நேரடி ஆலோசனைகள் மற்றும் துல்லிய வழிகாட்டுதல்`,
            tag: catName,
            badge: this.translationService.translate('home.expertConsultation', 'நிபுணர் ஆலோசனை'),
            image: astro.avatar_url || 'assets/images/temple_sunrise.png',
            icon: 'bi bi-stars'
          });
        }
      });
    }

    return Array.from(categoriesMap.values());
  }

  getAstrologersForCategory(cat: any): any[] {
    if (!this.astrologers || this.astrologers.length === 0) return [];
    if (!cat) return this.astrologers;

    return this.astrologers.filter(astro => {
      const catName = (astro.category || astro.role_title || '').trim();
      return catName === cat.title || catName === cat.id || (astro.category && astro.category === cat.title);
    });
  }

  // Open Service Screen Flow
  startServiceFlow(flowName: 'rasi-palan') {
    this.activeServiceFlow = flowName;
    this.serviceStep = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { flow: flowName },
      queryParamsHandling: 'merge'
    });
  }

  closeServiceFlow() {
    this.activeServiceFlow = null;
    this.serviceStep = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { flow: null },
      queryParamsHandling: 'merge'
    });
  }

  // Form Submission step managers
  nextStep() {
    this.bookingValidationError = '';
    if (!this.astrologerBookingForm.name || this.astrologerBookingForm.name.trim().length < 2) {
      this.bookingValidationError = 'தயவுசெய்து உங்கள் பெயரைச் சரியாக உள்ளிடவும்!';
      return;
    }
    const cleanPhone = (this.astrologerBookingForm.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      this.bookingValidationError = 'தயவுசெய்து சரியான 10 இலக்க அலைபேசி எண்ணை உள்ளிடவும்! (எ.கா: 9876543210)';
      return;
    }
    if (this.selectedCategory?.id !== 'vasthu') {
      if (!this.astrologerBookingForm.dob) {
        this.bookingValidationError = 'தயவுசெய்து உங்கள் பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்!';
        return;
      }
      if (!this.astrologerBookingForm.tob) {
        this.bookingValidationError = 'தயவுசெய்து உங்கள் பிறந்த நேரத்தைக் குறிப்பிடவும்!';
        return;
      }
    }
    if (!this.astrologerBookingForm.pob || this.astrologerBookingForm.pob.trim().length < 2) {
      this.bookingValidationError = 'தயவுசெய்து உங்கள் பிறந்த ஊர் / முகவரியை உள்ளிடவும்!';
      return;
    }
    if (this.isCurrentDateBlocked) {
      this.bookingValidationError = 'தேர்ந்தெடுத்த நாளில் ஜோதிடர் கிடைக்கவில்லை. தயவுசெய்து வேறு தேதியைத் தேர்ந்தெடுக்கவும்!';
      return;
    }
    this.serviceStep++;
  }

  prevStep() {
    if (this.serviceStep > 1) {
      this.serviceStep--;
    }
  }

  get totalAstrologerFee(): number {
    if (!this.selectedAstrologer) return 0;
    
    // Check which call type is selected and return its specific fee
    if (this.astrologerBookingForm.call_type === 'Phone' && this.selectedAstrologer.is_phone_call_available) {
      return this.selectedAstrologer.phone_call_fee;
    } else if (this.astrologerBookingForm.call_type === 'Video' && this.selectedAstrologer.is_video_call_available) {
      return this.selectedAstrologer.video_call_fee;
    } else if (this.astrologerBookingForm.call_type === 'Audio' && this.selectedAstrologer.is_audio_call_available) {
      return this.selectedAstrologer.audio_call_fee;
    }
    
    // Fallback to base fee if the selected option somehow became unavailable
    return this.selectedAstrologer.fee || 0;
  }

  startAstrologerBooking(astro: any) {
    this.selectedAstrologer = astro;
    const user = this.authService.getCurrentUser();
    this.astrologerBookingForm = {
      name: user?.name || '',
      phone: user?.phone || '',
      dob: '',
      tob: '',
      pob: '',
      date: new Date().toISOString().split('T')[0],
      slot: (astro.available_slots && astro.available_slots.length > 0) ? astro.available_slots[0] : '10:00 AM - 11:00 AM',
      call_type: 'Phone',
      notes: ''
    };
    this.activeServiceFlow = 'astrologer_consultation';
    this.serviceStep = 1;
  }

  get todayDateStr(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  get availableUpcomingDates(): { dateStr: string; label: string; dayName: string; isBlocked: boolean }[] {
    const dates: { dateStr: string; label: string; dayName: string; isBlocked: boolean }[] = [];
    const isEn = this.translationService.currentLanguage() === 'en';
    const days = isEn
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
    const months = isEn
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];

    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const isBlocked = !!(this.selectedAstrologer?.blocked_dates?.includes(dateStr));

      let label = `${months[d.getMonth()]} ${d.getDate()}`;
      if (i === 0) label = isEn ? 'Today' : 'இன்று';
      else if (i === 1) label = isEn ? 'Tomorrow' : 'நாளை';

      dates.push({
        dateStr,
        label,
        dayName: days[d.getDay()],
        isBlocked
      });
    }
    return dates;
  }

  get isCurrentDateBlocked(): boolean {
    if (!this.selectedAstrologer || !this.selectedAstrologer.blocked_dates) return false;
    return this.selectedAstrologer.blocked_dates.includes(this.astrologerBookingForm.date);
  }

  isDateEnabled = (dateIsoString: string) => {
    if (!this.selectedAstrologer || !this.selectedAstrologer.blocked_dates) return true;
    const date = dateIsoString.split('T')[0];
    return !this.selectedAstrologer.blocked_dates.includes(date);
  };

  onDateChange(event: any) {
    if (event?.detail?.value) {
      this.astrologerBookingForm.date = event.detail.value.split('T')[0];
    }
  }

  bookingRefCode: string = '';
  isProcessingPayment: boolean = false;
  bookingValidationError: string = '';

  payAndFulfillAstrologer() {
    this.bookingValidationError = '';
    if (!this.selectedAstrologer || this.isProcessingPayment) return;

    if (!this.astrologerBookingForm.name || this.astrologerBookingForm.name.trim().length < 2) {
      this.bookingValidationError = 'தயவுசெய்து உங்கள் பெயரைச் சரியாக உள்ளிடவும்!';
      return;
    }

    const cleanPhone = (this.astrologerBookingForm.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      this.bookingValidationError = 'தயவுசெய்து சரியான 10 இலக்க அலைபேசி எண்ணை உள்ளிடவும்! (எ.கா: 9876543210)';
      return;
    }

    if (this.selectedCategory?.id !== 'vasthu') {
      if (!this.astrologerBookingForm.dob) {
        this.bookingValidationError = 'தயவுசெய்து உங்கள் பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்!';
        return;
      }
      if (!this.astrologerBookingForm.tob) {
        this.bookingValidationError = 'தயவுசெய்து உங்கள் பிறந்த நேரத்தைக் குறிப்பிடவும்!';
        return;
      }
    }

    if (!this.astrologerBookingForm.pob || this.astrologerBookingForm.pob.trim().length < 2) {
      this.bookingValidationError = 'தயவுசெய்து உங்கள் பிறந்த ஊர் / முகவரியை உள்ளிடவும்!';
      return;
    }

    if (this.isCurrentDateBlocked) {
      this.bookingValidationError = 'தேர்ந்தெடுத்த நாளில் ஜோதிடர் கிடைக்கவில்லை. தயவுசெய்து வேறு தேதியைத் தேர்ந்தெடுக்கவும்!';
      return;
    }

    this.isProcessingPayment = true;

    const currentUser = this.authService.getCurrentUser();
    const astro = this.selectedAstrologer;
    const token = sessionStorage.getItem('auth_token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const amount = this.totalAstrologerFee;

    // 1. Create Razorpay Order via Backend
    this.http.post<any>(`${environment.apiUrl}/payments/create-order`, { amount }, { headers }).subscribe({
      next: (orderRes) => {
        if (orderRes && orderRes.success && typeof Razorpay !== 'undefined' && orderRes.key_id) {
          const options = {
            key: orderRes.key_id,
            amount: (orderRes.amount || amount) * 100,
            currency: orderRes.currency || 'INR',
            name: 'ஆருத்ரா ஜோதிடம்',
            description: `${astro.name} - ${astro.role_title}`,
            order_id: orderRes.order_id,
            prefill: {
              name: this.astrologerBookingForm.name || currentUser?.name || 'பயனர்',
              contact: this.astrologerBookingForm.phone || currentUser?.phone || '',
              email: currentUser?.email || 'user@astrology.com'
            },
            theme: {
              color: '#4A0E17'
            },
            handler: (response: any) => {
              // Razorpay payment successful
              this.completeBooking(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            },
            modal: {
              ondismiss: () => {
                this.isProcessingPayment = false;
              }
            }
          };

          try {
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
              this.isProcessingPayment = false;
              alert('கட்டணம் செலுத்துவதில் பிழை: ' + (resp.error?.description || 'தோல்வியடைந்தது'));
            });
            rzp.open();
          } catch (e: any) {
            this.isProcessingPayment = false;
            alert('Razorpay popup பிழை: ' + (e?.message || e));
          }
        } else {
          this.isProcessingPayment = false;
          alert('Razorpay ஆர்டர் உருவாக்குவதில் பிழை: ' + (orderRes?.message || 'Authentication failed. Please check Key ID & Secret in .env'));
        }
      },
      error: (err) => {
        this.isProcessingPayment = false;
        alert('Razorpay பிழை: ' + (err.error?.message || err.message || 'Authentication failed. Please check Key ID in .env'));
      }
    });
  }

  completeBooking(razorpayOrderId?: string, razorpayPaymentId?: string, razorpaySignature?: string) {
    const currentUser = this.authService.getCurrentUser();
    const astro = this.selectedAstrologer;
    const token = this.authService.getToken() || localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    this.bookingRefCode = 'ASTRO-' + Math.floor(100000 + Math.random() * 900000);

    const bookingPayload = {
      booking_id: this.bookingRefCode,
      user_name: this.astrologerBookingForm.name || currentUser?.name || 'பயனர்',
      user_phone: this.astrologerBookingForm.phone || currentUser?.phone || '',
      service_type: `${astro.name} (${astro.role_title})`,
      price: this.totalAstrologerFee,
      astrologer_id: astro.id,
      preferred_date: this.astrologerBookingForm.date,
      preferred_time: this.astrologerBookingForm.slot,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      details: {
        booking_ref: this.bookingRefCode,
        summary: `நேரடி ஜோதிட ஆலோசனை - ${astro.name}`,
        astrologer_name: astro.name,
        role_title: astro.role_title,
        date: this.astrologerBookingForm.date,
        slot: this.astrologerBookingForm.slot,
        call_type: this.astrologerBookingForm.call_type,
        dob: this.astrologerBookingForm.dob,
        tob: this.astrologerBookingForm.tob,
        pob: this.astrologerBookingForm.pob,
        notes: this.astrologerBookingForm.notes
      }
    };

    this.http.post<any>(`${environment.apiUrl}/bookings/create`, bookingPayload, { headers }).subscribe({
      next: (res) => {
        if (res && res.order_id) {
          this.bookingRefCode = res.order_id;
        }

        // Verify payment if signature exists
        if (razorpaySignature) {
          this.http.post<any>(`${environment.apiUrl}/payments/verify`, {
            order_id: this.bookingRefCode,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature
          }, { headers }).subscribe({
            next: () => {},
            error: () => {}
          });
        }

        this.isProcessingPayment = false;
        this.loadUserOrders();
        this.serviceStep = 3;
      },
      error: () => {
        this.isProcessingPayment = false;
        this.loadUserOrders();
        this.serviceStep = 3;
      }
    });
  }
}
