import { environment } from '../../../environments/environment';
import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject, ChangeDetectorRef, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare var AOS: any;

export interface ZodiacSign {
  name: string;
  englishName: string;
  symbol: string;
  dates: string;
  prediction: string;
  fullPrediction?: string;
  iconUrl?: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent implements OnInit, AfterViewInit {
  isMobileMenuOpen = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      if (typeof window !== 'undefined' && typeof AOS !== 'undefined') {
        setTimeout(() => {
          AOS.init({
            duration: 400,
            once: true,
            mirror: false,
            offset: 20,
            easing: 'ease-out'
          });
          AOS.refresh();
        }, 100);
      }
    });
  }

  ngOnInit() {
    this.loadLiveRasiPalan();
    this.loadLiveAstrologers();
    this.loadLivePanchangam();
    this.loadRasiIcons();
  }

  loadRasiIcons() {
    if (typeof window === 'undefined') return;
    this.http.get<any>(`${environment.apiUrl}/rasi-icons`).subscribe({
      next: (res) => {
        if (res && typeof res === 'object') {
          setTimeout(() => {
            this.zodiacSigns = this.zodiacSigns.map(z => ({
              ...z,
              iconUrl: res[z.name] || z.iconUrl || ''
            }));
            const cur = this.zodiacSigns.find(z => z.name === this.selectedZodiac.name);
            if (cur) this.selectedZodiac = cur;
            this.cdr.detectChanges();
          }, 0);
        }
      },
      error: () => { }
    });
  }

  loadLiveAstrologers() {
    if (typeof window === 'undefined') return;
    this.http.get<any>(`${environment.apiUrl}/public/astrologers`).subscribe({
      next: (res) => {
        if (res && Array.isArray(res.astrologers)) {
          setTimeout(() => {
            this.astrologers = res.astrologers;
            this.cdr.detectChanges();
          }, 0);
        }
      },
      error: () => { }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const monthsTamil = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
      const daysTamil = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
      const dayNum = d.getDate();
      const monthTamil = monthsTamil[d.getMonth()];
      const yearNum = d.getFullYear();
      const dayName = daysTamil[d.getDay()];
      return `${dayNum} ${monthTamil} ${yearNum}, ${dayName}`;
    } catch {
      return dateStr;
    }
  }

  loadLivePanchangam() {
    if (typeof window === 'undefined') return;
    this.http.get<any>(`${environment.apiUrl}/panchangam/today`).subscribe({
      next: (res) => {
        setTimeout(() => {
          if (res && res.panchangam) {
            const p = res.panchangam;
            this.panchangam = {
              date: p.date ? this.formatDate(p.date) : '',
              thithi: p.thithi || '',
              star: p.star || '',
              nallaNeram: p.nalla_neram || p.nallaNeram || '',
              rahukalam: p.rahukalam || '',
              yamagandam: p.yamagandam || '',
              sunrise: p.sunrise || '',
              sunset: p.sunset || ''
            };
          } else {
            this.panchangam = {
              date: '',
              sunrise: '',
              sunset: '',
              thithi: '',
              star: '',
              nallaNeram: '',
              rahukalam: '',
              yamagandam: ''
            };
          }
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => { }
    });
  }

  getShortPrediction(text: string): string {
    if (!text) return '';
    const cleanText = text.trim();
    if (cleanText.length <= 75) {
      return cleanText;
    }
    return cleanText.substring(0, 75).trim() + '...';
  }

  loadLiveRasiPalan() {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().split('T')[0];
    this.http.get<any>(`${environment.apiUrl}/rasi-palan?date=${today}&type=daily`).subscribe({
      next: (res) => {
        if (res && Array.isArray(res.predictions)) {
          setTimeout(() => {
            this.zodiacSigns = this.zodiacSigns.map(z => {
              const found = res.predictions.find((p: any) => p.rasi_name === z.name || p.rasi === z.name);
              const textFromDb = (found && found.prediction_text && found.prediction_text.trim().length > 0)
                ? found.prediction_text.trim()
                : 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.';
              return {
                ...z,
                fullPrediction: textFromDb,
                prediction: this.getShortPrediction(textFromDb),
                iconUrl: z.iconUrl || ''
              };
            });
            const cur = this.zodiacSigns.find(z => z.name === this.selectedZodiac.name);
            if (cur) this.selectedZodiac = cur;
            this.cdr.detectChanges();
          }, 0);
        }
      },
      error: () => { }
    });
  }

  ngAfterViewInit() {
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // 12 Zodiac signs with Tamil names and predictions
  zodiacSigns: ZodiacSign[] = [
    { name: 'மேஷம்', englishName: 'Aries', symbol: '♈', dates: 'மார்ச் 21 - ஏப்ரல் 19', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'ரிஷபம்', englishName: 'Taurus', symbol: '♉', dates: 'ஏப்ரல் 20 - மே 20', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'மிதுனம்', englishName: 'Gemini', symbol: '♊', dates: 'மே 21 - ஜூன் 20', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'கடகம்', englishName: 'Cancer', symbol: '♋', dates: 'ஜூன் 21 - ஜூலை 22', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'சிம்மம்', englishName: 'Leo', symbol: '♌', dates: 'ஜூலை 23 - ஆகஸ்ட் 22', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'கன்னி', englishName: 'Virgo', symbol: '♍', dates: 'ஆகஸ்ட் 23 - செப்டம்பர் 22', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'துலாம்', englishName: 'Libra', symbol: '♎', dates: 'செப்டம்பர் 23 - அக்டோபர் 22', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'விருச்சிகம்', englishName: 'Scorpio', symbol: '♏', dates: 'அக்டோபர் 23 - நவம்பர் 21', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'தனுசு', englishName: 'Sagittarius', symbol: '♐', dates: 'நவம்பர் 22 - டிசம்பர் 21', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'மகரம்', englishName: 'Capricorn', symbol: '♑', dates: 'டிசம்பர் 22 - ஜனவரி 19', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'கும்பம்', englishName: 'Aquarius', symbol: '♒', dates: 'ஜனவரி 20 - பிப்ரவரி 18', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' },
    { name: 'மீனம்', englishName: 'Pisces', symbol: '^{-/-}$', dates: 'பிப்ரவரி 19 - மார்ச் 20', prediction: 'இன்றைய ராசி பலன் தகவல்கள் விரைவில் வெளியிடப்படும்.', iconUrl: '' }
  ];

  selectedZodiac: ZodiacSign = this.zodiacSigns[0];

  selectZodiac(zodiac: any) {
    this.selectedZodiac = zodiac;
  }

  // Today's Panchangam details
  panchangam = {
    date: '',
    sunrise: '',
    sunset: '',
    thithi: '',
    star: '',
    nallaNeram: '',
    rahukalam: '',
    yamagandam: ''
  };

  // Divine Academy Courses (Module 4 - Learn Astrology)
  academyCourses = [
    {
      title: 'இளங்கலை வேத ஜோதிடம் (UG Course)',
      englishTitle: 'Diploma & Bachelor in Vedic Astrology',
      duration: '3 மாதங்கள்',
      lessons: '60 பாடங்கள்',
      rating: 4.9,
      students: '1200+ மாணவர்கள்',
      iconClass: 'bi bi-mortarboard-fill',
      badge: 'UG Course (இளங்கலை)'
    },
    {
      title: 'முதுகலை வேத ஜோதிடம் (PG Course)',
      englishTitle: 'Master & Doctorate in Vedic Astrology',
      duration: '3 மாதங்கள்',
      lessons: '60 பாடங்கள்',
      rating: 4.95,
      students: '850+ மாணவர்கள்',
      iconClass: 'bi bi-award-fill',
      badge: 'PG Course (முதுகலை)'
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
  currentReviews = this.testimonials.slice(0, 3);

  setReviewSet(index: number) {
    this.activeReviewSet = index;
    this.currentReviews = index === 0 ? this.testimonials.slice(0, 3) : this.testimonials.slice(3, 6);
    this.cdr.markForCheck();
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
