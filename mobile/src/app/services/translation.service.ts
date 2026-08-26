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
    error: "பிழை ஏற்பட்டது!",
    select: "தேர்ந்தெடுக்கவும்",
    required: "அவசியம்",
    all: "அனைத்தும்",
    yes: "ஆம்",
    no: "இல்லை",
    none: "ஏதுமில்லை",
    actions: "செயல்கள்",
    download: "பதிவிறக்க",
    watch: "பார்க்க",
    view: "பார்க்க"
  },
  nav: {
    home: "முகப்பு",
    learn: "கல்வி",
    astrology: "ஜோதிடம்",
    matching: "பொருத்தம்",
    profile: "சுயவிவரம்"
  },
  welcome: {
    brand: "ஆருத்ரா",
    guruName: "ஜெக சீனிவாசன்",
    guruTitle: "ஆன்மீக வழிகாட்டி மற்றும் வேத நிபுணர்",
    greeting: "வரவேற்கிறோம்",
    choosePath: "உங்கள் ஞானத்தின் பாதையைத் தேர்ந்தெடுக்கவும்",
    astrologyTitle: "ஜோதிட சேவைகள்",
    astrologyDesc: "நிபுணத்துவ ஜாதக வாசிப்புகள் மூலம் உங்கள் வாழ்க்கைப் பாதையை அறியுங்கள்",
    startBtn: "தொடங்க",
    learnTitle: "ஆன்மீக கல்வி",
    learnDesc: "புனித நூல்கள் மற்றும் தியான வழிகாட்டிகளோடு உங்கள் ஆன்மீக அறிவை வளருங்கள்",
    exploreBtn: "ஆராய"
  },
  login: {
    title: "ஆருத்ரா",
    subtitle: "உள்நுழைவு",
    usernamePlaceholder: "அலைபேசி எண் / பயனர் ஐடி",
    passwordPlaceholder: "கடவுச்சொல்",
    submitBtn: "உள்நுழைந்து தொடரவும்",
    needAccount: "புதிய கணக்கு வேண்டுமா?",
    registerNow: "பதிவு செய்க"
  },
  register: {
    title: "ஆருத்ரா",
    subtitle: "பதிவு செய்தல்",
    uploadPhoto: "படம் பதிவேற்றவும்",
    namePlaceholder: "உங்கள் முழுப் பெயர்",
    phonePlaceholder: "அலைபேசி எண்",
    emailPlaceholder: "மின்னஞ்சல் முகவரி",
    passwordPlaceholder: "கடவுச்சொல் (குறைந்தது 6 எழுத்துக்கள்)",
    confirmPasswordPlaceholder: "மீண்டும் கடவுச்சொல் உள்ளிடவும்",
    submitBtn: "பதிவு செய்து தொடரவும்",
    haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    loginNow: "உள்நுழைய"
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
    expertConsultation: "நிபுணர் ஆலோசனை",
    bookAppointment: "ஆலோசனை முன்பதிவு",
    price: "கட்டணம்"
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
    languageSetting: "செயலியின் மொழி",
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
    regRecords: "திருமணப் பதிவு விவரங்கள்",
    boyDetails: "ஆண் ஜாதக விவரங்கள்",
    girlDetails: "பெண் ஜாதக விவரங்கள்",
    boyName: "ஆண் பெயர்",
    girlName: "பெண் பெயர்",
    matchScore: "பொருத்தம் மதிப்பெண்",
    verdict: "முடிவு",
    superMatch: "உத்தம பொருத்தம் (Super Match)",
    goodMatch: "மத்தியம பொருத்தம் (Good Match)",
    averageMatch: "சாதாரண பொருத்தம்",
    poorMatch: "பொருத்தம் இல்லை"
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
    step2: "தொடர்பு விவரங்கள்",
    step3: "கல்வி & தொழில் விவரங்கள்",
    step4: "விண்ணப்ப சுருக்கம்",
    studentName: "மாணவர் பெயர்",
    fatherName: "தந்தை / கணவர் பெயர்",
    gender: "பாலினம்",
    male: "ஆண்",
    female: "பெண்",
    dob: "பிறந்த தேதி",
    age: "வயது",
    education: "கல்வித் தகுதி",
    job: "தொழில் / வேலை",
    phone: "வாட்ஸ்அப் எண்",
    email: "மின்னஞ்சல் முகவரி",
    address: "தபால் முகவரி",
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
    boughtTag: "வாங்கப்பட்டது",
    studentLogin: "மாணவர் உள்நுழைவு",
    studentLoginDesc: "உங்கள் பயனர் ஐடி / அலைபேசி எண் மற்றும் கடவுச்சொல் உள்ளிட்டு வகுப்பைத் தொடரவும்.",
    userIdLabel: "பயனர் ஐடி / அலைபேசி எண் / மின்னஞ்சல் *",
    passwordLabel: "கடவுச்சொல் *",
    loginBtn: "உள்நுழைவு ➔",
    backToIntro: "← புதிய சேர்க்கை பக்கத்திற்குச் செல்ல",
    quizTitle: "பயிற்சித் தேர்வு",
    question: "கேள்வி",
    of: "இல்",
    nextQuestion: "அடுத்த கேள்வி",
    submitQuiz: "தேர்வைச் சமர்ப்பி",
    quizPassed: "தேர்வில் வெற்றி பெற்றுள்ளீர்கள்!",
    quizFailed: "மீண்டும் முயற்சிக்கவும்!"
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
    viewHoroscope: "ஜாதகம் பார்க்க",
    bookNow: "முன்பதிவு செய்ய",
    bookingTitle: "ஆலோசனை முன்பதிவு",
    selectDate: "தேதியைத் தேர்ந்தெடுக்கவும்",
    selectSlot: "நேரத்தைத் தேர்ந்தெடுக்கவும்",
    yourDetails: "உங்கள் விவரங்கள்",
    name: "பெயர்",
    dob: "பிறந்த தேதி",
    tob: "பிறந்த நேரம்",
    pob: "பிறந்த இடம்",
    gothram: "கோத்திரம்",
    question: "உங்கள் கேள்வி / கருத்து",
    payAndBook: "கட்டணம் செலுத்தி முன்பதிவு செய்க",
    bookingConfirmed: "முன்பதிவு பெறப்பட்டது!",
    bookingSuccessMsg: "உங்கள் முன்பதிவு வெற்றிகரமாக முடிந்தது."
  },
  notifications: {
    title: "அறிவிப்புகள்",
    subtitle: "Notifications",
    markAllRead: "அனைத்தும் படித்தவை",
    emptyTitle: "புதிய அறிவிப்புகள் ஏதுமில்லை",
    emptyDesc: "தற்போது உங்களுக்கு எந்த புதிய தகவல்களும் இல்லை.",
    newBadge: "புதியது",
    downloadChart: "ஜாதகக் கோப்பைப் பார்க்க / பதிவிறக்க",
    watchVideo: "காணொளியைப் பார்க்க",
    viewDetail: "விவரம்"
  },
  panchangam: {
    title: "இன்றைய பஞ்சாங்கம்",
    sub: "துல்லிய கணிப்புகள்",
    thithi: "திதி",
    nakshatra: "நட்சத்திரம்",
    yogam: "யோகம்",
    karanam: "கரணம்",
    rahuKalam: "ராகு காலம்",
    yamagandam: "எமகண்டம்",
    gulikaKalam: "குளிகை காலம்",
    sunrise: "சூரியோதயம்",
    sunset: "சூரியாஸ்தமயம்"
  },
  rasipalan: {
    title: "இன்றைய ராசி பலன்",
    sub: "12 ராசிகளின் தினசரி பலன்கள்",
    selectRasi: "உங்கள் ராசியைத் தேர்ந்தெடுக்கவும்",
    luckyColor: "அதிர்ஷ்ட நிறம்",
    luckyNumber: "அதிர்ஷ்ட எண்"
  },
  errors: {
    enterStudentName: "தயவுசெய்து மாணவர் பெயரை உள்ளிடவும்.",
    selectDob: "தயவுசெய்து பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்.",
    enterPostalAddress: "தயவுசெய்து உங்கள் அஞ்சல் முகவரியை உள்ளிடவும்.",
    enterPincode: "தயவுசெய்து பின்கோடு எண்ணை உள்ளிடவும்.",
    enterValidMobile: "தயவுசெய்து சரியான 10 இலக்க அலைபேசி எண்ணை உள்ளிடவும்! (எ.கா: 9876543210)",
    enterValidEmail: "தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்! (எ.கா: student@gmail.com)",
    mudhunilaiCertRequired: "முதுநிலை வகுப்பிற்கு இளநிலை சான்றிதழ் அல்லது பயனர் ஐடி கட்டாயம்.",
    acceptRules: "தயவுசெய்து விதிமுறைகள் உறுதிமொழியை ஏற்கவும்.",
    fillAllFields: "தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும்",
    passwordMinLength: "கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்",
    passwordsDoNotMatch: "கடவுச்சொற்கள் பொருந்தவில்லை",
    enterPhoneAndPassword: "தயவுசெய்து அலைபேசி எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்",
    enterPhone: "தயவுசெய்து உங்கள் அலைபேசி எண்ணை உள்ளிடவும்",
    accountNotFound: "இந்த அலைபேசி எண்ணில் எந்தவொரு கணக்கும் இல்லை",
    fillRequiredFields: "அனைத்து கட்டாய விவரங்களையும் நிரப்பவும்.",
    somethingWentWrong: "பிழை ஏற்பட்டது. மீண்டும் முயலவும்.",
    dobRasiRequired: "பிறந்த தேதி மற்றும் ராசி கட்டாயம்.",
    loginRequired: "தயவுசெய்து உள்நுழைவு செய்யவும்.",
    saveError: "சேமிப்பில் பிழை ஏற்பட்டது.",
    nameDobRasiRequired: "பெயர், பிறந்த தேதி மற்றும் ராசி கட்டாயம்."
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
    error: "An error occurred!",
    select: "Select",
    required: "Required",
    all: "All",
    yes: "Yes",
    no: "No",
    none: "None",
    actions: "Actions",
    download: "Download",
    watch: "Watch",
    view: "View"
  },
  nav: {
    home: "Home",
    learn: "Learn",
    astrology: "Astrology",
    matching: "Matching",
    profile: "Profile"
  },
  welcome: {
    brand: "Arudra",
    guruName: "Jega Srinivasan",
    guruTitle: "Spiritual Guide & Vedic Expert",
    greeting: "Welcome",
    choosePath: "Choose Your Path of Knowledge",
    astrologyTitle: "Astrology Services",
    astrologyDesc: "Discover your life path through expert Vedic horoscope readings",
    startBtn: "Get Started",
    learnTitle: "Spiritual Education",
    learnDesc: "Grow your spiritual knowledge with sacred texts and meditation guides",
    exploreBtn: "Explore Now"
  },
  login: {
    title: "Arudra",
    subtitle: "Sign In",
    usernamePlaceholder: "Mobile Number / User ID",
    passwordPlaceholder: "Password",
    submitBtn: "Sign In to Continue",
    needAccount: "Need a new account?",
    registerNow: "Register Now"
  },
  register: {
    title: "Arudra",
    subtitle: "Sign Up",
    uploadPhoto: "Upload Profile Photo",
    namePlaceholder: "Full Name",
    phonePlaceholder: "Mobile Number",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password (Min 6 chars)",
    confirmPasswordPlaceholder: "Confirm Password",
    submitBtn: "Register & Continue",
    haveAccount: "Already have an account?",
    loginNow: "Sign In"
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
    expertConsultation: "Expert Consultation",
    bookAppointment: "Book Appointment",
    price: "Fee"
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
    regRecords: "Registration Details",
    boyDetails: "Boy's Horoscope Details",
    girlDetails: "Girl's Horoscope Details",
    boyName: "Boy's Name",
    girlName: "Girl's Name",
    matchScore: "Compatibility Score",
    verdict: "Verdict",
    superMatch: "Super Match",
    goodMatch: "Good Match",
    averageMatch: "Average Match",
    poorMatch: "Not Recommended"
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
    step2: "Contact Details",
    step3: "Education & Occupation Details",
    step4: "Application Summary",
    studentName: "Student Name",
    fatherName: "Father / Husband Name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    dob: "Date of Birth",
    age: "Age",
    education: "Educational Qualification",
    job: "Occupation / Job",
    phone: "WhatsApp Number",
    email: "Email Address",
    address: "Postal Address",
    rasi: "Rasi",
    nakshatra: "Nakshatra",
    next: "Next Step ➔",
    prev: "⬅ Previous Step",
    submitForm: "Submit Application ➔",
    dashboardTitle: "Student Dashboard",
    welcome: "Welcome",
    courseStatus: "Course Status",
    buyBooksTitle: "Astrology Books Store",
    buyBookBtn: "Buy Book",
    boughtTag: "Purchased",
    studentLogin: "Student Login",
    studentLoginDesc: "Enter your User ID / Phone / Email and Password to access your course.",
    userIdLabel: "User ID / Phone / Email *",
    passwordLabel: "Password *",
    loginBtn: "Sign In ➔",
    backToIntro: "← Back to Admission Form",
    quizTitle: "Practice Exam",
    question: "Question",
    of: "of",
    nextQuestion: "Next Question",
    submitQuiz: "Submit Exam",
    quizPassed: "Congratulations! You passed!",
    quizFailed: "Please try again!"
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
    viewHoroscope: "View Horoscope",
    bookNow: "Book Appointment",
    bookingTitle: "Consultation Booking",
    selectDate: "Select Date",
    selectSlot: "Select Time Slot",
    yourDetails: "Your Details",
    name: "Full Name",
    dob: "Date of Birth",
    tob: "Time of Birth",
    pob: "Place of Birth",
    gothram: "Gothram",
    question: "Your Question / Remarks",
    payAndBook: "Pay & Book Consultation",
    bookingConfirmed: "Booking Received!",
    bookingSuccessMsg: "Your booking has been successfully placed."
  },
  notifications: {
    title: "Notifications",
    subtitle: "Notifications",
    markAllRead: "Mark All as Read",
    emptyTitle: "No new notifications",
    emptyDesc: "You currently have no new notifications.",
    newBadge: "NEW",
    downloadChart: "View/Download Chart",
    watchVideo: "Watch Video",
    viewDetail: "View Details"
  },
  panchangam: {
    title: "Today's Panchangam",
    sub: "Accurate Vedic Calculations",
    thithi: "Thithi",
    nakshatra: "Nakshatra",
    yogam: "Yogam",
    karanam: "Karanam",
    rahuKalam: "Rahu Kalam",
    yamagandam: "Yamagandam",
    gulikaKalam: "Gulika Kalam",
    sunrise: "Sunrise",
    sunset: "Sunset"
  },
  rasipalan: {
    title: "Daily Horoscope",
    sub: "Daily Predictions for 12 Zodiac Rasis",
    selectRasi: "Select Your Rasi",
    luckyColor: "Lucky Color",
    luckyNumber: "Lucky Number"
  },
  errors: {
    enterStudentName: "Please enter student name.",
    selectDob: "Please select date of birth.",
    enterPostalAddress: "Please enter postal address.",
    enterPincode: "Please enter pincode.",
    enterValidMobile: "Please enter valid 10-digit mobile number! (e.g. 9876543210)",
    enterValidEmail: "Please enter valid email address! (e.g. student@gmail.com)",
    mudhunilaiCertRequired: "Previous certificate or user ID is required for Master level.",
    acceptRules: "Please accept the rules & declaration.",
    fillAllFields: "Please fill all required fields",
    passwordMinLength: "Password must be at least 6 characters",
    passwordsDoNotMatch: "Passwords do not match",
    enterPhoneAndPassword: "Please enter phone number and password",
    enterPhone: "Please enter your phone number",
    accountNotFound: "No account found with this phone number",
    fillRequiredFields: "Please fill all required fields.",
    somethingWentWrong: "An error occurred. Please try again.",
    dobRasiRequired: "Date of birth and Rasi are required.",
    loginRequired: "Please sign in.",
    saveError: "Error occurred while saving.",
    nameDobRasiRequired: "Name, date of birth and Rasi are required."
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
