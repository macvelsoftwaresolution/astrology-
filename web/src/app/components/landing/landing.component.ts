import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare var AOS: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, AfterViewInit {
  isMobileMenuOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLiveRasiPalan();
    this.loadLiveAstrologers();
    this.loadLivePanchangam();
  }

  loadLiveAstrologers() {
    if (typeof window === 'undefined') return;
    this.http.get<any>('http://127.0.0.1:8000/api/public/astrologers').subscribe({
      next: (res) => {
        if (res && Array.isArray(res.astrologers)) {
          this.astrologers = res.astrologers;
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  loadLivePanchangam() {
    if (typeof window === 'undefined') return;
    this.http.get<any>('http://127.0.0.1:8000/api/panchangam/today').subscribe({
      next: (res) => {
        if (res && res.panchangam) {
          this.panchangam = {
            ...this.panchangam,
            ...res.panchangam,
            nallaNeram: res.panchangam.nalla_neram || this.panchangam.nallaNeram,
            rahukalam: res.panchangam.rahukalam || this.panchangam.rahukalam,
            yamagandam: res.panchangam.yamagandam || this.panchangam.yamagandam
          };
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  loadLiveRasiPalan() {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().split('T')[0];
    this.http.get<any>(`http://127.0.0.1:8000/api/rasi-palan?date=${today}&type=daily`).subscribe({
      next: (res) => {
        if (res && Array.isArray(res.predictions) && res.predictions.length > 0) {
          this.zodiacSigns = this.zodiacSigns.map(z => {
            const found = res.predictions.find((p: any) => p.rasi_name === z.name);
            return {
              ...z,
              prediction: found && found.prediction_text ? found.prediction_text : z.prediction
            };
          });
          const cur = this.zodiacSigns.find(z => z.name === this.selectedZodiac.name);
          if (cur) this.selectedZodiac = cur;
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 400,
            once: false,
            mirror: false,
            offset: 20,
            easing: 'ease-out'
          });
          AOS.refresh();
        }
      }, 100);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // 12 Zodiac signs with Tamil names and predictions
  zodiacSigns = [
    { name: 'மேஷம்', englishName: 'Aries', symbol: '♈', dates: 'மார்ச் 21 - ஏப்ரல் 19', prediction: 'இன்று உங்களுக்கு சுப பலன்கள் அதிகரிக்கும். தொட்ட காரியங்கள் அனைத்தும் வெற்றியடையும்.' },
    { name: 'ரிஷபம்', englishName: 'Taurus', symbol: '♉', dates: 'ஏப்ரல் 20 - மே 20', prediction: 'இன்று தனலாபம் உண்டு. குடும்பத்தில் மகிழ்ச்சியும் அமைதியும் நிலவும்.' },
    { name: 'மிதுனம்', englishName: 'Gemini', symbol: '♊', dates: 'மே 21 - ஜூன் 20', prediction: 'தொழிலில் புதிய வாய்ப்புகள் தேடி வரும். நண்பர்களின் ஆதரவு கிடைக்கும்.' },
    { name: 'கடகம்', englishName: 'Cancer', symbol: '♋', dates: 'ஜூன் 21 - ஜூலை 22', prediction: 'மனதில் தெளிவும் உற்சாகமும் பிறக்கும். புதிய முயற்சிகள் கைகூடும்.' },
    { name: 'சிம்மம்', englishName: 'Leo', symbol: '♌', dates: 'ஜூலை 23 - ஆகஸ்ட் 22', prediction: 'தொழிலில் நல்ல முன்னேற்றம் காணப்படும். சுப நிகழ்ச்சிகள் திட்டமிடுவீர்கள்.' },
    { name: 'கன்னி', englishName: 'Virgo', symbol: '♍', dates: 'ஆகஸ்ட் 23 - செப்டம்பர் 22', prediction: 'அலுவலகத்தில் உங்களின் உழைப்பிற்கு நல்ல அங்கீகாரம் கிடைக்கும்.' },
    { name: 'துலாம்', englishName: 'Libra', symbol: '♎', dates: 'செப்டம்பர் 23 - அக்டோபர் 22', prediction: 'பயணங்களால் நன்மைகள் விளையும். பணப்புழக்கம் தாராளமாக இருக்கும்.' },
    { name: 'விருச்சிகம்', englishName: 'Scorpio', symbol: '♏', dates: 'அக்டோபர் 23 - நவம்பர் 21', prediction: 'ஆரோக்கியத்தில் கவனம் தேவை. காரியங்களில் சிந்தித்து செயல்படவும்.' },
    { name: 'தனுசு', englishName: 'Sagittarius', symbol: '♐', dates: 'நவம்பர் 22 - டிசம்பர் 21', prediction: 'தொழில் விரிவாக்க சிந்தனை மேலோங்கும். நல்ல லாபம் கிட்டும்.' },
    { name: 'மகரம்', englishName: 'Capricorn', symbol: '♑', dates: 'டிசம்பர் 22 - ஜனவரி 19', prediction: 'உறவினர்களின் ஆதரவு கிடைக்கும். தடைபட்ட காரியங்கள் நிவர்த்தியாகும்.' },
    { name: 'கும்பம்', englishName: 'Aquarius', symbol: '♒', dates: 'ஜனவரி 20 - பிப்ரவரி 18', prediction: 'சுப செய்தி வந்து சேரும். எதிர்பார்த்த தனவரவு உண்டாகும்.' },
    { name: 'மீனம்', englishName: 'Pisces', symbol: '♓', dates: 'பிப்ரவரி 19 - மார்ச் 20', prediction: 'ஆன்மீக சிந்தனை மேலோங்கும். புதிய மனிதர்களின் நட்பு கிடைக்கும்.' }
  ];

  selectedZodiac = this.zodiacSigns[0];

  selectZodiac(zodiac: any) {
    this.selectedZodiac = zodiac;
  }

  // Today's Panchangam details
  panchangam = {
    date: '10 ஆகஸ்ட் 2026, திங்கள்',
    sunrise: 'காலை 06:05 AM',
    sunset: 'மாலை 06:35 PM',
    thithi: 'ஏகாதசி (Ekadashi) - மாலை 04:30 PM வரை, பின்னர் துவாதசி',
    star: 'ரோகிணி (Rohini) - இரவு 09:15 PM வரை, பின்னர் மிருகசீரிடம்',
    nallaNeram: 'காலை 06:15 AM - 07:15 AM, மாலை 04:45 PM - 05:45 PM',
    rahukalam: 'காலை 07:30 AM - 09:00 AM',
    yamagandam: 'காலை 10:30 AM - 12:00 PM'
  };

  // Divine Academy Courses (Module 4 - Learn Astrology)
  academyCourses = [
    {
      title: 'வேத ஜோதிட அடிப்படை பயிற்சி',
      englishTitle: 'Vedic Astrology Fundamentals',
      duration: '12 வாரங்கள்',
      lessons: '24 பாடங்கள்',
      rating: 4.9,
      students: '1,200+ மாணவர்கள்',
      iconClass: 'bi bi-journal-text',
      badge: 'சான்றிதழ் படிப்பு'
    },
    {
      title: 'வாஸ்து சாஸ்திர ரகசியங்கள்',
      englishTitle: 'Vastu Shastra Consultancy Course',
      duration: '8 வாரங்கள்',
      lessons: '16 பாடங்கள்',
      rating: 4.8,
      students: '850+ மாணவர்கள்',
      iconClass: 'bi bi-compass',
      badge: 'பிரபலமான கோர்ஸ்'
    },
    {
      title: 'எண்கணிதம் & பெயர் தேர்வு கலை',
      englishTitle: 'Numerology & Naming Science',
      duration: '6 வாரங்கள்',
      lessons: '12 பாடங்கள்',
      rating: 4.9,
      students: '950+ மாணவர்கள்',
      iconClass: 'bi bi-calculator',
      badge: 'பிரத்தியேக பாடம்'
    }
  ];

  // Core Paid Astrology Services
  services = [
    {
      title: 'துல்லிய ஜாதகக் கணிப்பு',
      englishTitle: 'Horoscope Chart Creation',
      description: 'உங்கள் பிறந்த நேரம் மற்றும் இடத்தின் அடிப்படையில் வேத கணித கணிப்பு முறைப்படி ஜாதகக் கட்டங்கள் கணிக்கப்படும்.',
      price: '₹2,000',
      iconClass: 'bi bi-stars'
    },
    {
      title: 'திருமணப் பொருத்தம் கணித்தல்',
      englishTitle: 'Marriage Matchmaking',
      description: '10 பொருத்தங்கள், செவ்வாய் தோஷம், ராகு-கேது தோஷங்கள் மற்றும் தசாபுத்தி பொருத்தங்கள் துல்லியமாக ஆராயப்படும்.',
      price: '₹500',
      iconClass: 'bi bi-heart-fill'
    },
    {
      title: 'வாஸ்து தோஷ நிவர்த்தி',
      englishTitle: 'Vastu Consultancy',
      description: 'மனை, வீடு மற்றும் தொழில் நிறுவனங்களுக்கான வாஸ்து வரைபட ஆய்வு மற்றும் பரிகார ஆலோசனைகள்.',
      price: '₹2,500 - ₹5,000',
      iconClass: 'bi bi-house-door-fill'
    },
    {
      title: 'அதிர்ஷ்ட எண்கணிதம்',
      englishTitle: 'Numerology & Names',
      description: 'பிறந்த தேதிக்கு உகந்த அதிர்ஷ்ட பெயர்கள், தொழில் பெயர்கள் மற்றும் எண்கணித ஆலோசனைகள் வழங்கப்படுகின்றன.',
      price: '₹750',
      iconClass: 'bi bi-hash'
    }
  ];

  // Chief Astrologers (Live Database API)
  astrologers: any[] = [];

  // Verified Customer Reviews
  testimonials = [
    {
      name: 'கார்த்திக் ராஜா',
      location: 'சென்னை',
      comment: 'ஆருத்ரா ஜோதிடம் மூலம் எனது ஜாதகத்தை கணித்தேன். மிகவும் துல்லியமாகவும், எளிய பரிகாரங்களுடனும் விளக்கமாக இருந்தது. மொபைல் ஆப் பயன்படுத்துவது மிகவும் சுலபம்!',
      rating: 5,
      date: '2 நாட்களுக்கு முன்'
    },
    {
      name: 'பிரியா மோகன்',
      location: 'கோவை',
      comment: 'திருமண பொருத்தம் பார்ப்பதற்கு இந்த செயலியை பயன்படுத்தினோம். ஜோதிடர்களின் கணிப்புகள் மற்றும் பொறுமையான விளக்கங்கள் எங்களுக்கு மிகுந்த மனநிறைவை தந்தது.',
      rating: 5,
      date: '1 வாரத்திற்கு முன்'
    },
    {
      name: 'செல்வராஜ் கே.',
      location: 'மதுரை',
      comment: 'எனது புதிய அலுவலகத்திற்கு வாஸ்து ஆலோசனை பெற்றேன். வரைபடத்தை ஆப்பில் பதிவேற்றிய சில மணி நேரங்களில் தெளிவான விளக்கங்கள் கிடைத்தன. மிக்க நன்றி!',
      rating: 5,
      date: '2 வாரங்களுக்கு முன்'
    },
    {
      name: 'ஆனந்த் குமார்',
      location: 'திருச்சி',
      comment: 'தினசரி ராசி பலன்கள் மற்றும் பஞ்சாங்கம் நேரம் மிகவும் துல்லியமாக இருக்கிறது. தினமும் காலை இதை பார்த்துவிட்டு தான் வேலையை துவங்குவேன்.',
      rating: 5,
      date: '3 வாரங்களுக்கு முன்'
    },
    {
      name: 'கவிதா விஸ்வநாதன்',
      location: 'சேலம்',
      comment: 'குழந்தை பிறந்த நேரம் கொடுத்த சில மணி நேரங்களில் துல்லியமான பெயர் பரிந்துரைகளும் ஜாதக அறிக்கையும் கிடைத்தது. மிகவும் பயனுள்ள சேவை!',
      rating: 5,
      date: '1 மாதத்திற்கு முன்'
    },
    {
      name: 'தினேஷ் கார்த்திக்',
      location: 'நெல்லை',
      comment: 'ஆன்லைன் மூலமாக இவ்வளவு நேர்த்தியாகவும் மரியாதையாகவும் ஜோதிட ஆலோசனை கிடைக்கும் என்று எதிர்பார்க்கவில்லை. 100% திருப்திகரமான சேவை!',
      rating: 5,
      date: '1 மாதத்திற்கு முன்'
    }
  ];

  activeReviewSet = 0;

  get currentReviews() {
    return this.activeReviewSet === 0 ? this.testimonials.slice(0, 3) : this.testimonials.slice(3, 6);
  }

  setReviewSet(index: number) {
    this.activeReviewSet = index;
  }

  activeReviewIndex = 0;

  setActiveReview(index: number) {
    this.activeReviewIndex = index;
  }

  nextReview() {
    this.activeReviewIndex = (this.activeReviewIndex + 1) % this.testimonials.length;
  }

  prevReview() {
    this.activeReviewIndex = (this.activeReviewIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  // FAQs
  faqs = [
    {
      question: 'ஆருத்ரா ஜோதிடம் மொபைல் செயலியை எவ்வாறு பயன்படுத்துவது?',
      answer: 'எங்கள் மொபைல் செயலியை கூகிள் பிளே ஸ்டோர் அல்லது ஆப்பிள் ஆப் ஸ்டோரில் இருந்து பதிவிறக்கம் செய்து, உங்கள் மொபைல் எண்ணைக் கொண்டு சில நொடிகளில் கணக்கு தொடங்கிப் பயன்படுத்தலாம்.',
      open: false
    },
    {
      question: 'கட்டணம் செலுத்துவது எவ்வாறு? ஏதேனும் ரசீது கிடைக்குமா?',
      answer: 'ஆப் மூலம் UPI (GPay, PhonePe, Paytm), நெட் பேங்கிங் அல்லது கார்டுகள் மூலம் பாதுகாப்பாக கட்டணம் செலுத்தலாம். பணம் செலுத்தியவுடன் உங்களுக்கான பிரத்தியேக ரசீது மற்றும் ஆர்டர் எண் உங்கள் மொபைல் செயலியில் பதிவாகும்.',
      open: false
    },
    {
      question: 'ஜாதகம் கணித்து பெற எவ்வளவு நேரமாகும்?',
      answer: 'நீங்கள் விவரங்களை சமர்ப்பித்து கட்டணம் செலுத்திய 24 முதல் 48 மணி நேரத்திற்குள் எங்கள் தலைமை ஜோதிடர்கள் ஜாதகத்தை கணித்து, உங்கள் ஆப்பில் பி.டி.எப் (PDF) கோப்பாக பதிவேற்றம் செய்துவிடுவார்கள். உங்களுக்கு அறிவிப்பும் அனுப்பப்படும்.',
      open: false
    },
    {
      question: 'ஏதேனும் கேள்விகள் இருந்தால் ஜோதிடரிடம் பேச முடியுமா?',
      answer: 'ஆம், மொபைல் செயலியில் உள்ள "சந்திப்பு" அல்லது "ஆலோசனை" பிரிவின் மூலம் எங்கள் ஜோதிடர்களுடன் குறிப்பிட்ட நேரத்தில் நேரடி தொலைபேசி அல்லது சாட் மூலம் உரையாடி உங்களது சந்தேகங்களைத் தெளிவுபடுத்திக் கொள்ளலாம்.',
      open: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
