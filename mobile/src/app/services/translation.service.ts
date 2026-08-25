import { Injectable, signal, computed } from '@angular/core';

export type LanguageCode = 'ta' | 'en';

export const MOBILE_TA_TRANSLATIONS: Record<string, any> = {
  lang: {
    select: "மொழி",
    tamil: "தமிழ்",
    english: "English",
    toggleText: "English-க்கு மாற்றுக"
  },
  common: {
    save: "சேமி",
    saving: "சேமிக்கப்படுகிறது...",
    update: "புதுப்பி",
    loading: "ஏற்றப்படுகிறது...",
    cancel: "ரத்து",
    back: "பின்செல்",
    submit: "சமர்ப்பி",
    close: "மூடு",
    status: "நிலை",
    success: "வெற்றிகரமாக முடிந்தது!",
    error: "பிழை ஏற்பட்டது!"
  },
  nav: {
    home: "முகப்பு",
    learn: "கல்வி",
    astrology: "ஜோதிடம்",
    matching: "பொருத்தம்",
    profile: "சுயவிவரம்"
  },
  home: {
    greeting: "வணக்கம்",
    userFallback: "பயனர்",
    searchPlaceholder: "சேவைகளைத் தேடுங்கள்...",
    newService: "புதிய சேவை",
    keyServices: "முக்கிய சேவைகள்",
    todayPanchangam: "இன்றைய பஞ்சாங்கம்",
    accurateCalc: "துல்லிய கணிப்பு",
    thithi: "திதி",
    nakshatra: "நட்சத்திரம்",
    dailyRasiPalan: "ராசி பலன்",
    dailyCalc: "தினசரி கணக்கீடு",
    matrimonyMatch: "திருமண பொருத்தம்",
    horoscopeMatch: "ஜாதக இணைப்பு",
    writeHoroscope: "ஜாதகம் எழுத",
    newHoroscope: "புதிய ஜாதகம்",
    allServices: "சேவைகள்",
    viewAll: "அனைத்தும்",
    expertsCount: "நிபுணர்கள்",
    expertConsultation: "நிபுணர் ஆலோசனை"
  },
  profile: {
    title: "சுயவிவரம்",
    tabProfile: "சுயவிவரம்",
    tabHistory: "வரலாறு",
    tabPayments: "கட்டணங்கள்",
    tabNotifs: "அறிவிப்புகள்",
    tabSettings: "அமைப்புகள்",
    editTitle: "சுயவிவரம் திருத்தம்",
    editSubtitle: "உங்கள் தனிப்பட்ட தகவல்களை புதுப்பிக்கவும்",
    editProfilePill: "சுயவிவரத்தைத் திருத்து",
    myActivities: "எனது செயல்பாடுகள்",
    paymentHistory: "பணம் செலுத்திய வரலாறு",
    pastTransactions: "கடந்த கால பரிவர்த்தனைகள்",
    bookedServices: "பதிவு செய்யப்பட்ட சேவைகள்",
    yourBookings: "உங்கள் முன்பதிவுகள்",
    horoscopeRemedies: "ஜாதக பரிகாரம்",
    horoscopeStatus: "உங்கள் ஜாதக நிலவரம்",
    marriageRequests: "திருமண கோரிக்கைகள்",
    matchingProfiles: "பொருத்தமான வரன்கள்",
    privacyPolicy: "தனியுரிமைக் கொள்கை",
    termsConditions: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
    logout: "வெளியேறு",
    name: "பெயர்",
    phone: "தொலைபேசி எண்",
    address: "முகவரி",
    updateBtn: "புதுப்பி",
    astroTitle: "ஜோதிட சுயவிவரம்",
    rasi: "ராசி",
    star: "நட்சத்திரம்",
    lagnam: "லக்னம்",
    dob: "பிறந்த தேதி",
    tob: "பிறந்த நேரம்",
    pob: "பிறந்த ஊர்",
    historyTitle: "Appointment வரலாறு",
    historySubtitle: "உங்கள் அனைத்து bookings பட்டியல்",
    noHistory: "இதுவரை எந்த booking-ம் இல்லை.",
    paymentsTitle: "Payment வரலாறு",
    paymentsSubtitle: "அனைத்து பரிவர்த்தனைகள்",
    noPayments: "இதுவரை எந்த payment-ம் இல்லை.",
    notifsTitle: "அறிவிப்புகள்",
    markAllRead: "அனைத்தும் படித்தவை",
    noNotifs: "புதிய அறிவிப்புகள் இல்லை.",
    settingsTitle: "அமைப்புகள் & விருப்பத்தேர்வுகள்",
    settingsSubtitle: "உங்கள் மொழி மற்றும் அறிவிப்பு அமைப்புகளை நிர்வகிக்கவும்",
    languageSetting: "செயலியின் மொழி (App Language)",
    dailyNotif: "தினசரி ராசி பலன் அறிவிப்பு",
    dailyNotifDesc: "ஒவ்வொரு காலையிலும் 6 மணிக்கு உங்கள் ராசி பலன் அறிவிப்பு"
  },
  matching: {
    selectNeed: "உங்கள் தேவையைத் தேர்ந்தெடுக்கவும்",
    varanRegBadge: "வரன் பதிவு",
    varanRegTitle: "திருமண பதிவு",
    varanRegDesc: "புதிய வரன் விவரங்களை பதிவு செய்து பொருத்தமான வாழ்க்கைத்துணையைக் கண்டறியலாம்.",
    registerBtn: "பதிவு செய்க",
    porutham10Badge: "10 பொருத்தம்",
    porutham10Title: "திருமண பொருத்தம்",
    porutham10Desc: "ஆண் மற்றும் பெண் ஜாதகங்களை ஒப்பிட்டு 10 பொருத்தங்களின் அளவீட்டை அறியலாம்.",
    checkPoruthamBtn: "பொருத்தம் பார்க்க",
    historyToggle: "முந்தைய பதிவுகளின் வரலாறு",
    matchRecords: "திருமண பொருத்தம் பதிவுகள்",
    regRecords: "திருமணப் பதிவு விவரங்கள்"
  },
  learn: {
    title: "ஜோதிட சாஸ்திர வித்யாலயம்",
    subtitle: "ஸ்ரீ ஆருத்ரா ஜோதிட சாஸ்திர வித்யாலயம்",
    admissionTitle: "விரைவு பயிற்சி மாணவர் சேர்க்கை விண்ணப்ப படிவம்",
    selectCategory: "சேர்க்கை நிலை (Select Category)",
    ilanilaiTitle: "இளநிலை",
    ilanilaiSub: "Fast Track • அடிப்படை ஜோதிட சாஸ்திரம் & விதிகள்",
    muthunilaiTitle: "முதுநிலை",
    muthunilaiSub: "Master • உயர்நிலை ஆய்வுக் கணிப்புகள்",
    step1: "தனிப்பட்ட விவரங்கள்",
    step2: "தொடர்பு & ஜாதக விவரங்கள்",
    step3: "கட்டணம் செலுத்த",
    step4: "விண்ணப்ப சுருக்கம்",
    studentName: "மாணவர் பெயர் *",
    fatherName: "தந்தை / கணவர் பெயர்",
    gender: "பாலினம் *",
    dob: "பிறந்த தேதி *",
    age: "வயது",
    education: "கல்வித் தகுதி *",
    job: "தொழில் / வேலை *",
    phone: "வாட்ஸ்அப் எண் *",
    email: "மின்னஞ்சல் முகவரி *",
    address: "தபால் முகவரி *",
    rasi: "ராசி",
    nakshatra: "நட்சத்திரம்",
    next: "அடுத்த படி ➔",
    prev: "⬅ முந்தைய படி",
    submitForm: "விண்ணப்பத்தைச் சமர்ப்பி ➔",
    dashboardTitle: "மாணவர் தளம் (Student Dashboard)",
    welcome: "வரவேற்கிறோம்",
    courseStatus: "பாடநெறி நிலை",
    buyBooksTitle: "ஜோதிடப் பாடப் புத்தகங்கள் (Books Store)",
    buyBookBtn: "புத்தகம் வாங்குக",
    boughtTag: "வாங்கப்பட்டது"
  },
  astrology: {
    title: "வேத ஜோதிட சேவைகள்",
    subtitle: "ஸ்ரீ ஆருத்ரா ஜோதிட சாஸ்திர வித்யாலயம்",
    myJathagam: "என் ஜாதகம்",
    rasiPalan: "இன்றைய ராசி பலன்",
    matching: "திருமண பொருத்தம்",
    paraJathagam: "ஜாதகம் எழுதுதல்",
    vastu: "வாஸ்து ஆலோசனை",
    services: "ஆலோசனை முன்பதிவு",
    quickAstrology: "விரைவு ஜோதிட சேவைகள்",
    selectRasi: "உங்கள் ராசியைத் தேர்வு செய்க",
    viewHoroscope: "ஜாதகம் பார்க்க"
  }
};

export const MOBILE_EN_TRANSLATIONS: Record<string, any> = {
  lang: {
    select: "Language",
    tamil: "தமிழ்",
    english: "English",
    toggleText: "Switch to தமிழ்"
  },
  common: {
    save: "Save",
    saving: "Saving...",
    update: "Update",
    loading: "Loading...",
    cancel: "Cancel",
    back: "Back",
    submit: "Submit",
    close: "Close",
    status: "Status",
    success: "Success!",
    error: "An error occurred!"
  },
  nav: {
    home: "Home",
    learn: "Learn",
    astrology: "Astrology",
    matching: "Matching",
    profile: "Profile"
  },
  home: {
    greeting: "Welcome",
    userFallback: "User",
    searchPlaceholder: "Search astrology services...",
    newService: "New Service",
    keyServices: "Key Services",
    todayPanchangam: "Today's Panchangam",
    accurateCalc: "Accurate Predictions",
    thithi: "Thithi",
    nakshatra: "Nakshatra / Star",
    dailyRasiPalan: "Daily Horoscope",
    dailyCalc: "Daily Predictions",
    matrimonyMatch: "Marriage Matching",
    horoscopeMatch: "Horoscope Match",
    writeHoroscope: "Write Horoscope",
    newHoroscope: "New Birth Chart",
    allServices: "All Services",
    viewAll: "View All",
    expertsCount: "Astrologers",
    expertConsultation: "Expert Consultation"
  },
  profile: {
    title: "Profile",
    tabProfile: "Profile",
    tabHistory: "History",
    tabPayments: "Payments",
    tabNotifs: "Notifications",
    tabSettings: "Settings",
    editTitle: "Edit Profile",
    editSubtitle: "Update your personal profile information",
    editProfilePill: "Edit Profile",
    myActivities: "My Activities",
    paymentHistory: "Payment History",
    pastTransactions: "Past Transactions",
    bookedServices: "Booked Services",
    yourBookings: "Your Bookings",
    horoscopeRemedies: "Horoscope Remedies",
    horoscopeStatus: "Your Horoscope Status",
    marriageRequests: "Marriage Requests",
    matchingProfiles: "Matching Profiles",
    privacyPolicy: "Privacy Policy",
    termsConditions: "Terms & Conditions",
    logout: "Sign Out",
    name: "Full Name",
    phone: "Phone Number",
    address: "Address",
    updateBtn: "Update Profile",
    astroTitle: "Astrology Profile",
    rasi: "Rasi (Zodiac)",
    star: "Nakshatra (Star)",
    lagnam: "Lagnam",
    dob: "Date of Birth",
    tob: "Time of Birth",
    pob: "Place of Birth",
    historyTitle: "Appointment History",
    historySubtitle: "List of all your consultation bookings",
    noHistory: "No consultation bookings found.",
    paymentsTitle: "Payment History",
    paymentsSubtitle: "All transaction history records",
    noPayments: "No transaction records found.",
    notifsTitle: "Notifications",
    markAllRead: "Mark All as Read",
    noNotifs: "No new notifications.",
    settingsTitle: "Settings & Preferences",
    settingsSubtitle: "Manage your app language and notification preferences",
    languageSetting: "App Language",
    dailyNotif: "Daily Horoscope Notification",
    dailyNotifDesc: "Receive daily 6 AM horoscope predictions notification"
  },
  matching: {
    selectNeed: "Select Your Requirement",
    varanRegBadge: "Matrimony Reg.",
    varanRegTitle: "Matrimony Registration",
    varanRegDesc: "Register groom/bride profiles and find compatible life partners.",
    registerBtn: "Register Now",
    porutham10Badge: "10 Porutham Match",
    porutham10Title: "Marriage Compatibility",
    porutham10Desc: "Compare boy & girl horoscopes to check 10 Porutham match scores.",
    checkPoruthamBtn: "Check Match",
    historyToggle: "Previous Registration History",
    matchRecords: "Marriage Match Records",
    regRecords: "Registration Details"
  },
  learn: {
    title: "Astrology Academy",
    subtitle: "Sri Arudra Astrology School",
    admissionTitle: "Fast Track Student Admission Application Form",
    selectCategory: "Select Course Level",
    ilanilaiTitle: "Ilanilai (Fast Track)",
    ilanilaiSub: "Fast Track • Fundamental Astrology & Rules",
    muthunilaiTitle: "Mudhunilai (Master)",
    muthunilaiSub: "Master • Advanced Analytical Predictions",
    step1: "Personal Details",
    step2: "Contact & Horoscope Details",
    step3: "Payment",
    step4: "Application Summary",
    studentName: "Student Name *",
    fatherName: "Father / Husband Name",
    gender: "Gender *",
    dob: "Date of Birth *",
    age: "Age",
    education: "Educational Qualification *",
    job: "Occupation / Job *",
    phone: "WhatsApp Number *",
    email: "Email Address *",
    address: "Postal Address *",
    rasi: "Rasi",
    nakshatra: "Nakshatra",
    next: "Next Step ➔",
    prev: "⬅ Previous Step",
    submitForm: "Submit Application ➔",
    dashboardTitle: "Student Dashboard",
    welcome: "Welcome",
    courseStatus: "Course Status",
    buyBooksTitle: "Astrology Study Books Store",
    buyBookBtn: "Buy Book",
    boughtTag: "Purchased"
  },
  astrology: {
    title: "Vedic Astrology Services",
    subtitle: "Sri Arudra Astrology School",
    myJathagam: "My Horoscope",
    rasiPalan: "Daily Rasi Palan",
    matching: "Marriage Matching",
    paraJathagam: "Write Horoscope",
    vastu: "Vastu Consultation",
    services: "Book Consultation",
    quickAstrology: "Quick Astrology Services",
    selectRasi: "Select Your Rasi",
    viewHoroscope: "View Horoscope"
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSignal = signal<LanguageCode>('ta');
  public currentLanguage = computed(() => this.currentLanguageSignal());
  public version = signal<number>(1);

  private translations: Record<LanguageCode, Record<string, any>> = {
    ta: { ...MOBILE_TA_TRANSLATIONS },
    en: { ...MOBILE_EN_TRANSLATIONS }
  };

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (typeof window !== 'undefined') {
      const savedLang = (localStorage.getItem('astro_mobile_lang') || sessionStorage.getItem('astro_mobile_lang')) as LanguageCode;
      if (savedLang === 'ta' || savedLang === 'en') {
        this.currentLanguageSignal.set(savedLang);
      }
    }
  }

  public setLanguage(lang: LanguageCode): void {
    this.currentLanguageSignal.set(lang);
    this.version.update((v) => v + 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astro_mobile_lang', lang);
      sessionStorage.setItem('astro_mobile_lang', lang);
    }
  }

  public toggleLanguage(): void {
    const next = this.currentLanguageSignal() === 'ta' ? 'en' : 'ta';
    this.setLanguage(next);
  }

  public translate(key: string, fallback?: string): string {
    this.version();
    const lang = this.currentLanguageSignal();
    const data = this.translations[lang] || {};

    const keys = key.split('.');
    let result: any = data;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result !== undefined && typeof result === 'string') {
      return result;
    }

    // Fallback if missing
    if (lang !== 'en' && this.translations['en']) {
      let enResult: any = this.translations['en'];
      for (const k of keys) {
        if (enResult && typeof enResult === 'object' && k in enResult) {
          enResult = enResult[k];
        } else {
          enResult = undefined;
          break;
        }
      }
      if (enResult !== undefined && typeof enResult === 'string') {
        return enResult;
      }
    }

    return fallback !== undefined ? fallback : key;
  }

  public t(key: string, fallback?: string): string {
    return this.translate(key, fallback);
  }
}
