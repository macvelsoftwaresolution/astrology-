import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { App } from '@capacitor/app';

interface Order {
  id: string;
  service: string;
  price: number;
  date: string;
  status: 'Pending' | 'Completed';
  details: string;
}

declare var Razorpay: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
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

  // Forms Data Binding Models for the consultation flows
  horoscopeForm = {
    name: '',
    dob: '',
    tob: '',
    pob: '',
    gender: 'ஆண்'
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
    queryType: 'பெயர் மாற்று ஆலோசனை'
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
    { name: 'மேஷம்', english: 'Aries', image: '♈' },
    { name: 'ரிஷபம்', english: 'Taurus', image: '♉' },
    { name: 'மிதுனம்', english: 'Gemini', image: '♊' },
    { name: 'கடகம்', english: 'Cancer', image: '♋' },
    { name: 'சிம்மம்', english: 'Leo', image: '♌' },
    { name: 'கன்னி', english: 'Virgo', image: '♍' },
    { name: 'துலாம்', english: 'Libra', image: '♎' },
    { name: 'விருச்சிகம்', english: 'Scorpio', image: '♏' },
    { name: 'தனுசு', english: 'Sagittarius', image: '♐' },
    { name: 'மகரம்', english: 'Capricorn', image: '♑' },
    { name: 'கும்பம்', english: 'Aquarius', image: '♒' },
    { name: 'மீனம்', english: 'Pisces', image: '♓' }
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
    { title: 'அலுவலக வாஸ்து', sub: 'தொழில் முன்னேற்றம் மற்றும் லாபம் தரும் ஆலோசனைகள்.', price: 5000 },
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
    private authService: AuthService
  ) {
    App.addListener('backButton', () => {
      this.ngZone.run(() => {
        // Only run back button handler if we are active on the home page route
        if (this.router.url !== '/home') {
          return;
        }
        if (this.activeServiceFlow) {
          if (this.serviceStep > 1 && this.serviceStep !== 4) {
            this.prevStep();
          } else {
            this.closeServiceFlow();
          }
        } else if (this.currentTab !== 'home') {
          this.selectTab('home');
        } else {
          App.exitApp();
        }
      });
    });
  }

  ngOnInit() {
    this.checkAuth();
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
    this.currentTab = tab;
    this.activeServiceFlow = null;
    this.serviceStep = 1;
  }

  // Open Service Screen Flow
  startServiceFlow(flowName: 'horoscope' | 'vastu' | 'ramajayam' | 'srinivasan' | 'rasi-palan') {
    this.activeServiceFlow = flowName;
    this.serviceStep = 1;
  }

  closeServiceFlow() {
    this.activeServiceFlow = null;
    this.serviceStep = 1;
  }

  // Form Submission step managers
  nextStep() {
    this.serviceStep++;
  }

  prevStep() {
    if (this.serviceStep > 1) {
      this.serviceStep--;
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
