import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { App } from '@capacitor/app';
import { ToastController } from '@ionic/angular';
import { RasiPalanComponent } from '../components/rasi-palan/rasi-palan.component';

interface Order {
  id: string;
  service: string;
  price: number;
  date: string;
  status: 'Pending' | 'Completed';
  details: string;
}

import { BackButtonService } from '../services/back-button.service';

declare var Razorpay: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  @ViewChild(RasiPalanComponent) rasiComponent?: RasiPalanComponent;

  // Navigation Tabs State
  currentTab: 'home' | 'services' | 'matching' | 'profile' = 'home';

  // Sub-view Screen flow states for consultation workflows
  activeServiceFlow: null | 'horoscope' | 'vastu' | 'ramajayam' | 'srinivasan' | 'rasi-palan' = null;
  serviceStep: number = 1; // 1: Info/List, 2: Form, 3: Payment, 4: Success

  // Selected sub-items
  selectedVastuService: any = null;
  selectedRamajayamService: any = null;
  selectedSrinivasanService: any = null;

  // Profile Orders List
  userOrders: Order[] = [
    {
      id: 'AST-2026-001',
      service: 'ஜாதகம் எழுதுதல்',
      price: 2000,
      date: '10-Aug-2026',
      status: 'Pending',
      details: 'Name: Rajesh Kumar, DOB: 24-Jul-1988'
    }
  ];

  get userInitial(): string {
    const user = this.authService.getCurrentUser();
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return '🕉️';
  }

  // Hero Slider
  heroBanners = [
    {
      image: 'assets/images/temple_sunrise.png',
      badge: 'இன்றைய சிறப்பு',
      title: 'இன்றைய ராசி பலன்',
      subtitle: 'உங்கள் விதியை இன்று அறிந்து கொள்ளுங்கள்'
    },
    {
      image: 'assets/images/nataraja.png',
      badge: 'புதிய சேவை',
      title: 'திருமண பொருத்தம்',
      subtitle: 'சிறந்த வாழ்க்கைத்துணையை தேர்ந்தெடுக்க'
    },
    {
      image: 'assets/images/spiritual_education_bg.png',
      badge: 'ஆன்மீகம்',
      title: 'ஜாதகம் எழுதுதல்',
      subtitle: 'துல்லியமான ஜாதக கணிப்பு'
    }
  ];
  currentBannerIndex = 0;
  private sliderInterval: any;

  // Forms Data Binding Models for the consultation flows
  horoscopeForm = {
    name: '',
    dob: '',
    tob: '',
    pob: '',
    gender: 'ஆண்',
    date: ''
  };

  vastuForm = {
    name: '',
    phone: '',
    address: '',
    date: '',
    planUploaded: false
  };

  ramajayamForm = {
    name: '',
    phone: '',
    dob: '',
    queryType: 'பெயர் மாற்று ஆலோசனை',
    date: ''
  };

  srinivasanForm = {
    name: '',
    dob: '',
    tob: '',
    pob: '',
    queryType: 'ஜாதக பலன்',
    date: ''
  };

  // 12 Zodiac list
  rasis = [
    { name: 'மேஷம்', english: 'Aries', image: '♈', imagePath: 'assets/images/zodiac/aries.png' },
    { name: 'ரிஷபம்', english: 'Taurus', image: '♉', imagePath: 'assets/images/zodiac/taurus.png' },
    { name: 'மிதுனம்', english: 'Gemini', image: '♊', imagePath: 'assets/images/zodiac/gemini.png' },
    { name: 'கடகம்', english: 'Cancer', image: '♋', imagePath: 'assets/images/zodiac/cancer.png' },
    { name: 'சிம்மம்', english: 'Leo', image: '♌', imagePath: 'assets/images/zodiac/leo.png' },
    { name: 'கன்னி', english: 'Virgo', image: '♍', imagePath: 'assets/images/zodiac/virgo.png' },
    { name: 'துலாம்', english: 'Libra', image: '♎', imagePath: 'assets/images/zodiac/libra.png' },
    { name: 'விருச்சிகம்', english: 'Scorpio', image: '♏', imagePath: 'assets/images/zodiac/scorpio.png' },
    { name: 'தனுசு', english: 'Sagittarius', image: '♐', imagePath: 'assets/images/zodiac/sagittarius.png' },
    { name: 'மகரம்', english: 'Capricorn', image: '♑', imagePath: 'assets/images/zodiac/capricorn.png' },
    { name: 'கும்பம்', english: 'Aquarius', image: '♒', imagePath: 'assets/images/zodiac/aquarius.png' },
    { name: 'மீனம்', english: 'Pisces', image: '♓', imagePath: 'assets/images/zodiac/pisces.png' }
  ];

  // Today's Panchangam values
  panchangam = {
    thithi: 'ஏகாதசி',
    star: 'ரோகினி',
    rahukalam: '10:30 - 12:00',
    yamagandam: '09:15 - 10:15'
  };

  // Vastu Services lists
  vastuServices = [
    { title: 'வீட்டு வாஸ்து', sub: 'உங்களின் இல்லத்திற்கு அமைதியான மற்றும் மகிழ்ச்சியூட்டும் ஆலோசனை.', price: 2500 },
    { title: 'அலுவலக வாஸ்து', sub: 'தொழில் முன்னேற்றம் மற்றும் லாபம் தரும் ஆলোசனைகள்.', price: 5000 },
    { title: 'வரைபட ஆய்வு', sub: 'புதிய கட்டிட வரைபடங்களை வாஸ்து முறைப்படி ஆய்வு செய்தல்.', price: 3500 }
  ];

  // Guru Ramajayam Services lists
  ramajayamServices = [
    { title: 'பெயர் மாற்று ஆலோசனை', sub: 'எண்கணித முறையில் உங்களது அதிர்ஷ்ட பெயரை தேர்வு செய்ய.', price: 750 },
    { title: 'தொழில் எண் கணிதம்', sub: 'நிறுவனங்களின் பெயரை எண்கணித முறைப்படி மாற்றியமைக்க.', price: 750 },
    { title: 'குழந்தை பெயர் தேர்வு', sub: 'பிறந்த குழந்தையின் நட்சத்திரத்திற்கேற்ற அதிர்ஷ்ட பெயர் சூட்ட.', price: 750 }
  ];

  // Guru Srinivasan Services lists
  srinivasanServices = [
    { title: 'ஜாதக பலன்', sub: 'பிரச்சனைகளுக்கு ஜாதகம் பார்த்து பரிகாரங்கள் அறிதல்.', price: 1500 },
    { title: 'வாஸ்து ஆலோசனை', sub: 'மனைகளின் வாஸ்து அமைப்பை சரிபார்க்க நேரடி ஆலோசனை.', price: 2500 },
    { title: 'சுப முகூர்த்தம்', sub: 'திருமணம் மற்றும் கிரகப்பிரவேசத்திற்கு உகந்த நேரம் தேர்வு.', price: 1000 }
  ];

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private backButtonService: BackButtonService,
    private toastController: ToastController
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

  customBackHandler = () => {
    return this.goBackStep();
  };

  handleOverlayBack() {
    this.goBackStep();
  }

  private pushHistory() {
    const current = { tab: this.currentTab, flow: this.activeServiceFlow, step: this.serviceStep };
    const last = this.navHistory[this.navHistory.length - 1];
    if (!last || last.tab !== current.tab || last.flow !== current.flow || last.step !== current.step) {
      this.navHistory.push(current);
    }
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

    // 2. Step-by-step history pop
    if (this.navHistory.length > 1) {
      this.navHistory.pop(); // remove current state
      const prevState = this.navHistory[this.navHistory.length - 1];
      if (prevState) {
        this.currentTab = prevState.tab;
        this.activeServiceFlow = prevState.flow;
        this.serviceStep = prevState.step;
        this.syncQueryParams();
        return true;
      }
    }

    // 3. Sequential fallbacks
    if (this.serviceStep > 1 && this.serviceStep !== 4) {
      this.prevStep();
      return true;
    } else if (this.activeServiceFlow) {
      this.closeServiceFlow();
      return true;
    } else if (this.currentTab !== 'home') {
      this.currentTab = 'home';
      this.navHistory = [{ tab: 'home', flow: null, step: 1 }];
      this.syncQueryParams();
      return true;
    }

    return false;
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
    if (this.activeServiceFlow === 'horoscope') return 'ஜாதகம் எழுதுதல்';
    if (this.activeServiceFlow === 'vastu') return 'வாஸ்து ஆலோசனைகள்';
    if (this.activeServiceFlow === 'ramajayam') return 'குரு ராமஜெயம் (எண்கணிதம்)';
    if (this.activeServiceFlow === 'srinivasan') return 'குரு ஸ்ரீநிவாசன் ஆலோசனை';
    if (this.activeServiceFlow === 'rasi-palan') return 'இன்றைய ராசி பலன்';

    switch (this.currentTab) {
      case 'services': return 'ஜோதிட சேவைகள்';
      case 'matching': return 'திருமண பொருத்தம்';
      case 'profile': return 'சுயவிவரம்';
      default: return 'ஆருத்ரா ஜோதிடம்';
    }
  }

  canShowBackButton(): boolean {
    return this.activeServiceFlow !== null || this.currentTab !== 'home';
  }

  async showNotificationToast() {
    const toast = await this.toastController.create({
      message: 'புதிய அறிவிப்புகள் ஏதுமில்லை',
      duration: 2000,
      color: 'dark',
      position: 'bottom'
    });
    await toast.present();
  }

  ngOnInit() {
    this.checkAuth();
    this.startSlider();

    this.route.queryParams.subscribe(params => {
      if (params['tab'] && ['home', 'services', 'matching', 'profile'].includes(params['tab'])) {
        this.currentTab = params['tab'];
      }
      if (params['flow']) {
        this.activeServiceFlow = params['flow'];
      }
    });
  }

  ionViewWillEnter() {
    this.checkAuth();
  }

  private checkAuth() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/welcome']);
    }
  }

  // Change Navigation tabs
  selectTab(tab: 'home' | 'services' | 'matching' | 'profile') {
    if (this.currentTab === tab && !this.activeServiceFlow) return;
    this.currentTab = tab;
    this.activeServiceFlow = null;
    this.serviceStep = 1;
    this.pushHistory();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab, flow: null },
      queryParamsHandling: 'merge'
    });
  }

  // Open Service Screen Flow
  startServiceFlow(flowName: 'horoscope' | 'vastu' | 'ramajayam' | 'srinivasan' | 'rasi-palan') {
    this.activeServiceFlow = flowName;
    this.serviceStep = 1;
    this.pushHistory();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { flow: flowName },
      queryParamsHandling: 'merge'
    });
  }

  closeServiceFlow() {
    this.activeServiceFlow = null;
    this.serviceStep = 1;
    this.pushHistory();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { flow: null },
      queryParamsHandling: 'merge'
    });
  }

  // Form Submission step managers
  nextStep() {
    this.serviceStep++;
    this.pushHistory();
  }

  prevStep() {
    if (this.serviceStep > 1) {
      this.serviceStep--;
      this.pushHistory();
    }
  }

  // File Upload Simulate for Vastu Plan
  onFileChange(event: any) {
    this.vastuForm.planUploaded = true;
  }

  // Select sub service types
  selectVastu(service: any) {
    this.selectedVastuService = service;
    this.vastuForm.address = '';
    this.nextStep();
  }

  selectRamajayam(service: any) {
    this.selectedRamajayamService = service;
    this.ramajayamForm.queryType = service.title;
    this.nextStep();
  }

  selectSrinivasan(service: any) {
    this.selectedSrinivasanService = service;
    this.srinivasanForm.queryType = service.title;
    this.nextStep();
  }

  // Payment triggers & confirmation simulations
  payAndFulfill(serviceName: string, price: number, details: string) {
    const localOrderId = 'AST-2026-' + Math.floor(100 + Math.random() * 900);

    const options = {
      key: 'rzp_test_yourKeyId', // Replace with your key in production
      amount: price * 100, // amount in paise
      currency: 'INR',
      name: 'ஆருத்ரா ஜோதிடம்',
      description: serviceName + ' - ' + details,
      handler: (response: any) => {
        // Payment success callback from Razorpay
        console.log('Payment successful: ', response);

        this.userOrders.unshift({
          id: localOrderId,
          service: serviceName,
          price: price,
          date: '10-Aug-2026',
          status: 'Pending',
          details: `${details} (Razorpay ID: ${response.razorpay_payment_id})`
        });

        this.serviceStep = 4;
      },
      prefill: {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        contact: '9876543210'
      },
      theme: {
        color: '#4A0E17' // Maroon theme color matching our design
      }
    };

    try {
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e) {
      console.warn('Razorpay failed to load, falling back to simulated payment...', e);
      // Fallback to simulation if offline / SDK not loaded
      setTimeout(() => {
        this.userOrders.unshift({
          id: localOrderId,
          service: serviceName,
          price: price,
          date: '10-Aug-2026',
          status: 'Pending',
          details: details + ' (Simulated)'
        });
        this.serviceStep = 4; // Show success screen
      }, 800);
    }
  }
}
