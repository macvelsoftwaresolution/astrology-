import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type LanguageCode = 'ta' | 'en';

export const TA_TRANSLATIONS: Record<string, any> = {
  brand: {
    name: "ஆஸ்ட்ரோ டிவைன்",
    subtitle: "மேலாண்மை தளம்",
    portal: "நிர்வாக தளம்"
  },
  lang: {
    select: "மொழி",
    tamil: "தமிழ்",
    english: "English"
  },
  nav: {
    overview: "கண்ணோட்டம் & பகுப்பாய்வு",
    team: "குழு & ஜோதிடர்கள்",
    lms: "பாடங்கள் & பாடத்திட்டம்",
    courier: "கூரியர் & புத்தக ஆர்டர்கள்",
    grading: "தேர்வு மதிப்பீடு & சான்றிதழ்",
    services: "முன்பதிவுகள் & ஜோதிடர்கள்",
    rasi_editor: "ராசி பலன் பதிப்பாசிரியர்",
    matches: "திருமணப் பொருத்தப் பதிவு",
    payments: "பணப்பரிவர்த்தனைப் பட்டியல்",
    broadcast: "அறிவிப்புகள் அனுப்பு",
    users: "பதிவுசெய்த பயனர்கள்",
    menu: "பட்டியல்",
    close: "மூடு"
  },
  user: {
    profile: "சுயவிவரம்",
    signOut: "வெளியேறு",
    editProfile: "சுயவிவரத்தைத் திருத்து",
    saveProfile: "சுயவிவரத்தைச் சேமி",
    fullName: "முழுப் பெயர்",
    email: "மின்னஞ்சல்",
    phone: "தொலைபேசி எண்",
    address: "முகவரி",
    newPassword: "புதிய கடவுச்சொல் (விருப்பப்பட்டால் மட்டும்)"
  },
  common: {
    save: "சேமி",
    saving: "சேமிக்கப்படுகிறது...",
    saveChanges: "மாற்றங்களைச் சேமி",
    cancel: "ரத்து",
    delete: "நீக்கு",
    edit: "திருத்து",
    back: "பின்செல்",
    refresh: "புதுப்பி",
    search: "தேடுக...",
    actions: "செயல்கள்",
    details: "விவரங்கள்",
    status: "நிலை",
    view: "பார்வை",
    close: "மூடு",
    confirmDelete: "நிச்சயமாக நீக்க வேண்டுமா?",
    success: "வெற்றிகரமாக முடிந்தது!",
    error: "பிழை ஏற்பட்டது!",
    all: "அனைத்தும்",
    today: "இன்று",
    loading: "தரவுகள் ஏற்றப்படுகின்றன...",
    noRecords: "பதிவுகள் எதுவும் இல்லை",
    active: "செயலில் உள்ளது",
    inactive: "செயலற்றது"
  },
  overview: {
    title: "கண்ணோட்டம் & பகுப்பாய்வு",
    subtitle: "உங்கள் தளத்தின் நேரலை அளவீடுகள் மற்றும் வருவாய் சுருக்கம்",
    refreshMetrics: "அளவீடுகளைப் புதுப்பி",
    totalRevenue: "மொத்த வருவாய்",
    registeredStudents: "பதிவுசெய்த மாணவர்கள்",
    astrologyBookings: "ஜோதிட முன்பதிவுகள்",
    bookOrders: "புத்தகம் & கூரியர் ஆர்டர்கள்",
    revenueBreakdown: "வருவாய் பிரிவு விவரம்",
    courseRevenue: "பாட விற்பனை வருவாய்",
    astrologyRevenue: "ஜோதிட ஆலோசனை வருவாய்",
    booksRevenue: "புத்தகங்கள் விற்பனை வருவாய்",
    grandTotal: "மொத்த கூட்டுத்தொகை",
    activeTeam: "செயலில் உள்ள நிர்வாகக் குழு",
    manageTeam: "குழு மேலாண்மை ➔"
  },
  team: {
    title: "நிர்வாகிகள் & தலைமை ஜோதிடர்கள்",
    subtitle: "பயனர் அனுமதிகள், நிர்வாகப் பொறுப்புகள் மற்றும் அணுகல் அமைப்புகள்",
    addMember: "+ புதிய குழு உறுப்பினர்",
    user: "பயனர் பெயர்",
    email: "மின்னஞ்சல்",
    phone: "தொலைபேசி",
    role: "பொறுப்பு / பதவி",
    status: "நிலை",
    actions: "செயல்கள்",
    modalTitle: "புதிய நிர்வாகி / ஜோதிடர் கணக்கு உருவாக்குதல்",
    fullName: "முழுப் பெயர் *",
    securePass: "பாதுகாப்பான கடவுச்சொல் *",
    platformRole: "தளப் பொறுப்பு",
    roleAdmin: "நிர்வாகி (முழு அணுகல்)",
    roleAstro: "ஜோதிடர் (ஆலோசனை நிறைவேற்றுபவர்)",
    createAccount: "கணக்கை உருவாக்கு"
  },
  lms: {
    title: "வேத ஜோதிடக் கல்வி & பாடத்திட்டம்",
    subtitle: "பாடங்கள், வீடியோ வகுப்புகள், ஆடியோ மந்திரங்கள், PDF குறிப்புகள் மற்றும் விலைக் கட்டுப்பாடு",
    launchWizard: "+ புதிய பாடம் சேர்",
    searchPlaceholder: "பாடங்கள், தலைப்புகள் தேடுக...",
    level: "நிலை:",
    levelAll: "அனைத்தும்",
    levelBeg: "தொடக்க நிலை",
    levelInter: "நடுத்தர நிலை",
    levelAdv: "உயர் நிலை",
    modules: "பிரிவுகள்",
    lessons: "பாடங்கள்",
    viewSyllabus: "முழுப் பாடத்திட்டம்",
    addModule: "+ பிரிவு",
    syllabusModalTitle: "பாடத்திட்டம் & பாட இணைப்புகள்",
    addLesson: "+ பாடம் சேர்",
    preview: "முன்னோட்டம்",
    modalAddModule: "புதிய பாடப் பிரிவு சேர்த்தல்",
    modalAddLesson: "புதிய வீடியோ / ஆடியோ பாடம் சேர்த்தல்",
    moduleTitle: "பிரிவின் தலைப்பு *",
    lessonTitle: "பாடத்தின் தலைப்பு *",
    contentType: "உள்ளடக்க வகை",
    contentUrl: "வீடியோ / ஆடியோ / PDF URL *",
    duration: "கால அளவு (எ.கா: 20 நிமிடங்கள்)",
    freePreview: "இலவச முன்னோட்டமாக அனுமதிக்கவும்"
  },
  courier: {
    title: "கூரியர் அனுப்பீடு & புத்தக ஆர்டர்கள்",
    subtitle: "வாடிக்கையாளர் முகவரிகள், பார்சல் டிராக்கிங் எண் மற்றும் டெலிவரி நிலை",
    totalOrders: "மொத்த ஆர்டர்கள்",
    pendingDispatch: "அனுப்பப்பட வேண்டியவை",
    inTransit: "வழியில் உள்ளது",
    delivered: "சேர்க்கப்பட்டது",
    orderId: "ஆர்டர் ID",
    client: "வாடிக்கையாளர் & முகவரி",
    items: "பொருட்கள்",
    amount: "தொகை",
    courierPartner: "கூரியர் நிறுவனம் & எண்",
    updateCourier: "கூரியர் விவரம் மாற்று",
    modalTitle: "கூரியர் அனுப்பீட்டு விவரம் சேர்த்தல்",
    partner: "கூரியர் நிறுவனம்",
    trackingNo: "டிராக்கிங் எண் (AWB)",
    saveDispatch: "அனுப்பீட்டைப் பதிவு செய்"
  },
  grading: {
    title: "தேர்வு மதிப்பீடு & சான்றிதழ் மேலாண்மை",
    subtitle: "மாணவர்களின் விடைத்தாள் சரிபார்ப்பு, மதிப்பெண்கள் மற்றும் ஆன்லைன் சான்றிதழ் வெளியீடு",
    submissions: "விடைத்தாள்கள்",
    passed: "தேர்ச்சி பெற்றோர்",
    pendingReview: "சரிபார்க்க வேண்டியவை",
    student: "மாணவர் பெயர்",
    examTitle: "தேர்வின் தலைப்பு",
    score: "மதிப்பெண்",
    certStatus: "சான்றிதழ் நிலை",
    evaluate: "மதிப்பிடு",
    modalTitle: "தேர்வு விடைத்தாள் மதிப்பீடு & சான்றிதழ்",
    marksAwarded: "வழங்கப்படும் மதிப்பெண் (100-க்கு) *",
    feedback: "ஆசிரியர் குறிப்பு / பின்னூட்டம்",
    issueCert: "சான்றிதழ் வழங்குக"
  },
  services: {
    title: "முன்பதிவுகள் & தலைமை ஜோதிடர்கள்",
    subtitle: "ஜோதிடர்கள் மேலாண்மை மற்றும் வாடிக்கையாளர் ஆலோசனை முன்பதிவுகள்",
    viewBookings: "முன்பதிவுகள்",
    viewAstrologers: "ஜோதிடர்கள்",
    addAstrologer: "+ புதிய ஜோதிடர்",
    newBooking: "+ புதிய முன்பதிவு",
    astrologersList: "தலைமை ஜோதிடர்கள் பட்டியல்",
    addAstrologerBtn: "+ புதிய ஜோதிடர் சேர்",
    editAstrologer: "அமைப்புகள்",
    deleteAstrologer: "ஜோதிடரை நீக்கு",
    totalBookings: "மொத்த முன்பதிவு",
    pending: "காத்திருப்பவை",
    inProgress: "பேசப்படுகிறது",
    completed: "முடிந்தது",
    totalRevenue: "மொத்த வருவாய்",
    tabProfile: "சுயவிவரம்",
    tabSlots: "நேரங்கள்",
    tabCalendar: "விடுப்பு காலண்டர்",
    name: "ஜோதிடர் பெயர்",
    roleTitle: "பதவி",
    fee: "கட்டணம் (₹)",
    experience: "அனுபவம்",
    status: "நிலை",
    phone: "தொலைபேசி",
    rating: "ரேட்டிங்",
    consultations: "ஆலோசனைகள்",
    specialty: "சிறப்பு நிபுணத்துவம்",
    bio: "சுயவிவரக் குறிப்பு",
    avatar: "சுயவிவரப் படம்",
    uploadPhoto: "படம் பதிவேற்று",
    presetIcons: "ஐகான் அவதார்",
    quickSlots: "பரிந்துரைக்கப்பட்ட நேரங்கள்",
    addSlot: "புதிய நேரம் சேர்க்க",
    activeSlots: "தற்போது இயங்கும் நேரங்கள்",
    blockSundays: "ஞாயிறுகளை விடுப்பாக்கு",
    unblockAll: "அனைத்து நாட்களையும் திற",
    client: "வாடிக்கையாளர்",
    serviceType: "சேவை வகை",
    preferredDate: "விரும்பிய தேதி / நேரம்",
    bookingDate: "பதிவு தேதி",
    call: "அழைக்கவும்",
    whatsapp: "வாட்ஸ்அப்"
  },
  rasi_editor: {
    title: "12 ராசி பலன் பதிப்பாசிரியர் & பஞ்சாங்கம்",
    subtitle: "தினசரி மற்றும் வாராந்திர ராசி பலன்கள், கிரக நிலைகள் மற்றும் பஞ்சாங்கக் கணிப்புகள்",
    todayPanchangam: "இன்றைய பஞ்சாங்கம்",
    savePanchangam: "பஞ்சாங்கத்தைச் சேமி",
    updatePanchangam: "பஞ்சாங்கத்தைப் புதுப்பி",
    saveAllRasis: "12 ராசி பலன்களையும் சேமி",
    selectRasi: "ராசியைத் தேர்வு செய்க:",
    thithi: "திதி",
    nakshatra: "நட்சத்திரம்",
    star: "நட்சத்திரம்",
    rahukalam: "இராகு காலம்",
    yamagandam: "எமகண்டம்",
    nallaNeram: "நல்ல நேரம்",
    generalPrediction: "பொதுவான பலன்",
    careerPrediction: "தொழில் & உத்தியோகம்",
    financePrediction: "பொருளாதாரம் & வரவு",
    familyPrediction: "குடும்பம் & ஆரோக்கியம்",
    luckyNumber: "அதிர்ஷ்ட எண்",
    luckyColor: "அதிர்ஷ்ட நிறம்"
  },
  matches: {
    title: "திருமணப் பொருத்தப் பதிவுகள் & தொலைபேசி ஆலோசனைகள்",
    subtitle: "பயனர்கள் பார்த்த 10 பொருத்த விவரங்கள் மற்றும் நேரடி ஜோதிட வழிகாட்டுதல்",
    totalMatches: "மொத்த பொருத்தப் பதிவுகள்",
    consultationRequested: "ஆலோசனை கோரியவர்கள்",
    boyDetails: "ஆண் விவரம் (ராசி / நட்சத்திரம்)",
    girlDetails: "பெண் விவரம் (ராசி / நட்சத்திரம்)",
    points: "பொருத்த மதிப்பெண்",
    viewReport: "பொருத்த அறிக்கை",
    callClient: "வாடிக்கையாளரை அழை"
  },
  payments: {
    title: "பணப்பரிவர்த்தனைப் பட்டியல் & கணக்குப் புத்தகம்",
    subtitle: "Razorpay நேரடிப் பரிவர்த்தனைகள், கட்டண ரசீதுகள் மற்றும் பண விநியோகம்",
    totalTrans: "மொத்தப் பரிவர்த்தனைகள்",
    successAmount: "வெற்றிகரமான தொகை",
    paymentId: "பரிவர்த்தனை ID",
    amount: "தொகை",
    method: "செலுத்திய முறை",
    date: "தேதி",
    status: "நிலை"
  },
  broadcast: {
    title: "பயனர்களுக்கு நேரலை அறிவிப்புகள் அனுப்பு",
    subtitle: "Mobile App மற்றும் Web பயனர்களுக்கு முக்கியமான ஆன்மீக அறிவிப்புகள் மற்றும் விழிப்பூட்டல்கள்",
    sendNow: "அறிவிப்பை அனுப்பு",
    msgTitle: "அறிவிப்பின் தலைப்பு *",
    msgBody: "அறிவிப்பு உரை / செய்தி *",
    targetAudience: "பெறுநர்கள்",
    allUsers: "அனைத்து பயனர்கள்",
    studentsOnly: "மாணவர்கள் மட்டும்",
    sentHistory: "அனுப்பப்பட்ட அறிவிப்புகள் வரலாறு"
  },
  users: {
    title: "பதிவுசெய்த பயனர்கள் & மாணவர்கள் பட்டியல்",
    subtitle: "மொபைல் ஆப் மற்றும் வலைத்தளத்தில் இணைந்த பயனர் கணக்குகள்",
    searchUser: "பயனர் பெயர் / தொலைபேசி எண் தேடுக...",
    totalCount: "மொத்தப் பயனர்கள்",
    userId: "பயனர் ID",
    name: "பெயர்",
    contact: "தொடர்பு விவரம்",
    registeredOn: "பதிவுசெய்த தேதி",
    status: "கணக்கு நிலை"
  }
};

export const EN_TRANSLATIONS: Record<string, any> = {
  brand: {
    name: "Astro Divine",
    subtitle: "Management Engine",
    portal: "Admin Portal"
  },
  lang: {
    select: "Language",
    tamil: "தமிழ்",
    english: "English"
  },
  nav: {
    overview: "Overview & Analytics",
    team: "Team & Astrologers",
    lms: "Learn & Course Studio",
    courier: "Courier & Book Orders",
    grading: "Exam Valuation & Certs",
    services: "Appointment Bookings",
    rasi_editor: "Rasi Palan Editor",
    matches: "Marriage Match Log",
    payments: "Payment Transactions",
    broadcast: "Notify Users",
    users: "Registered Users",
    menu: "Menu",
    close: "Close"
  },
  user: {
    profile: "Profile",
    signOut: "Sign Out",
    editProfile: "Edit Admin Profile",
    saveProfile: "Save Profile",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Address",
    newPassword: "New Password (Optional)"
  },
  common: {
    save: "Save",
    saving: "Saving...",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    refresh: "Refresh",
    search: "Search...",
    actions: "Actions",
    details: "Details",
    status: "Status",
    view: "View",
    close: "Close",
    confirmDelete: "Are you sure you want to delete this?",
    success: "Operation completed successfully!",
    error: "An error occurred!",
    all: "All",
    today: "Today",
    loading: "Loading data from database...",
    noRecords: "No records found",
    active: "Active",
    inactive: "Inactive"
  },
  overview: {
    title: "Command Center & Analytics",
    subtitle: "Real-time platform metrics, telemetry, and revenue overview.",
    refreshMetrics: "Refresh Metrics",
    totalRevenue: "Total Platform Revenue",
    registeredStudents: "Registered Students",
    astrologyBookings: "Astrology Bookings",
    bookOrders: "Book & Courier Orders",
    revenueBreakdown: "Revenue Breakdown",
    courseRevenue: "Course Sales Revenue",
    astrologyRevenue: "Astrology Consultation Revenue",
    booksRevenue: "Books & Physical Goods",
    grandTotal: "Grand Total",
    activeTeam: "Active Management Team",
    manageTeam: "Manage Team ➔"
  },
  team: {
    title: "Platform Administrators & Astrologers",
    subtitle: "Role-based access control, credentials, and executive system privileges.",
    addMember: "+ Add Team Member",
    user: "User Name",
    email: "Email Address",
    phone: "Phone",
    role: "Role / Position",
    status: "Status",
    actions: "Actions",
    modalTitle: "Create New Admin / Astrologer Account",
    fullName: "Full Name *",
    securePass: "Secure Password *",
    platformRole: "Platform Role",
    roleAdmin: "Administrator (Full Access)",
    roleAstro: "Astrologer (Consultation Fulfillment)",
    createAccount: "Create Account"
  },
  lms: {
    title: "Vedic Astrology Learning Academy & Course Studio",
    subtitle: "Interactive curriculum design, video lessons, audio slokas, downloadable PDF materials, and price controls.",
    launchWizard: "+ Launch Course Studio Wizard",
    searchPlaceholder: "Search astrology courses, titles, categories...",
    level: "Level:",
    levelAll: "All",
    levelBeg: "Beginner",
    levelInter: "Intermediate",
    levelAdv: "Advanced",
    modules: "Modules",
    lessons: "Lessons",
    viewSyllabus: "View Full Syllabus",
    addModule: "+ Module",
    syllabusModalTitle: "Course Curriculum & Lesson Assets",
    addLesson: "+ Add Lesson",
    preview: "Preview",
    modalAddModule: "Add New Course Module",
    modalAddLesson: "Add New Video / Audio Lesson",
    moduleTitle: "Module Title *",
    lessonTitle: "Lesson Title *",
    contentType: "Content Type",
    contentUrl: "Video / Audio / PDF URL *",
    duration: "Duration (e.g. 20 mins)",
    freePreview: "Allow Free Preview"
  },
  courier: {
    title: "Courier & Book Orders Management",
    subtitle: "Client shipping addresses, AWB tracking numbers, and delivery lifecycle management.",
    totalOrders: "Total Orders",
    pendingDispatch: "Pending Dispatch",
    inTransit: "In Transit",
    delivered: "Delivered",
    orderId: "Order ID",
    client: "Client & Address",
    items: "Items",
    amount: "Amount",
    courierPartner: "Courier Partner & AWB",
    updateCourier: "Update Courier",
    modalTitle: "Update Dispatch & Tracking Details",
    partner: "Courier Company",
    trackingNo: "Tracking Number (AWB)",
    saveDispatch: "Save Dispatch Info"
  },
  grading: {
    title: "Exam Valuation & Certificate Management",
    subtitle: "Evaluate student answer sheets, score grades, and issue verified completion certificates.",
    submissions: "Submissions",
    passed: "Passed Students",
    pendingReview: "Pending Review",
    student: "Student Name",
    examTitle: "Exam Title",
    score: "Score",
    certStatus: "Certificate Status",
    evaluate: "Evaluate",
    modalTitle: "Exam Valuation & Certificate Issuance",
    marksAwarded: "Marks Awarded (out of 100) *",
    feedback: "Teacher Feedback / Notes",
    issueCert: "Issue Certificate"
  },
  services: {
    title: "Appointments & Chief Astrologers",
    subtitle: "Astrologers Management and Client Consultation Bookings",
    viewBookings: "Appointment Bookings",
    viewAstrologers: "Chief Astrologers",
    addAstrologer: "+ Add Astrologer",
    newBooking: "+ New Booking",
    astrologersList: "Chief Astrologers Directory",
    addAstrologerBtn: "+ Add New Astrologer",
    editAstrologer: "Manage & Slots",
    deleteAstrologer: "Delete Astrologer",
    totalBookings: "Total Bookings",
    pending: "Pending",
    inProgress: "In-Progress",
    completed: "Completed",
    totalRevenue: "Total Revenue",
    tabProfile: "Profile",
    tabSlots: "Timing Slots",
    tabCalendar: "Leave Calendar",
    name: "Astrologer Name",
    roleTitle: "Designation / Role",
    fee: "Consultation Fee (₹)",
    experience: "Experience",
    status: "Current Status",
    phone: "Direct Phone",
    rating: "Rating",
    consultations: "Consultations",
    specialty: "Specializations",
    bio: "Biography / About",
    avatar: "Profile Avatar",
    uploadPhoto: "Upload Photo",
    presetIcons: "Preset Icons",
    quickSlots: "Suggested Quick Slots",
    addSlot: "Add Custom Slot",
    activeSlots: "Active Timing Slots",
    blockSundays: "Block All Sundays",
    unblockAll: "Unblock All Days",
    client: "Client & Contact",
    serviceType: "Service Type",
    preferredDate: "Preferred Date / Slot",
    bookingDate: "Booking Date",
    call: "Call Client",
    whatsapp: "WhatsApp"
  },
  rasi_editor: {
    title: "12 Rasi Palan Editor & Panchangam",
    subtitle: "Daily & Weekly astrology horoscope predictions, planetary rulers, and panchangam settings.",
    todayPanchangam: "Today's Panchangam",
    savePanchangam: "Save Panchangam",
    updatePanchangam: "Update Panchangam",
    saveAllRasis: "Save All 12 Rasis",
    selectRasi: "Select Zodiac Sign:",
    thithi: "Thithi",
    nakshatra: "Nakshatra",
    star: "Nakshatra / Star",
    rahukalam: "Rahu Kalam",
    yamagandam: "Yamagandam",
    nallaNeram: "Nalla Neram (Auspicious Time)",
    generalPrediction: "General Prediction",
    careerPrediction: "Career & Profession",
    financePrediction: "Finance & Wealth",
    familyPrediction: "Family & Health",
    luckyNumber: "Lucky Number",
    luckyColor: "Lucky Color"
  },
  matches: {
    title: "Marriage Compatibility Log & Consultations",
    subtitle: "View verified 10 Porutham match reports and connect clients to chief astrologers.",
    totalMatches: "Total Match Reports",
    consultationRequested: "Consultation Requested",
    boyDetails: "Boy (Rasi / Nakshatra)",
    girlDetails: "Girl (Rasi / Nakshatra)",
    points: "Score / Points",
    viewReport: "View Report",
    callClient: "Call Client"
  },
  payments: {
    title: "Payment Transactions Ledger",
    subtitle: "Live Razorpay transaction records, receipts, and revenue reconciliation.",
    totalTrans: "Total Transactions",
    successAmount: "Total Successful Volume",
    paymentId: "Payment ID",
    amount: "Amount",
    method: "Payment Method",
    date: "Date & Time",
    status: "Status"
  },
  broadcast: {
    title: "Broadcast Live Notifications to Users",
    subtitle: "Send push notifications and announcements directly to Mobile App and Web users.",
    sendNow: "Send Broadcast Message",
    msgTitle: "Notification Title *",
    msgBody: "Notification Body / Message *",
    targetAudience: "Target Audience",
    allUsers: "All Registered Users",
    studentsOnly: "Course Students Only",
    sentHistory: "Broadcast Dispatch History"
  },
  users: {
    title: "Registered Users & Students Directory",
    subtitle: "List of all user profiles registered on the mobile application and website.",
    searchUser: "Search by name, email or phone...",
    totalCount: "Total Users",
    userId: "User ID",
    name: "Name",
    contact: "Contact Info",
    registeredOn: "Registered Date",
    status: "Account Status"
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguageSignal = signal<LanguageCode>('ta');
  public currentLanguage = computed(() => this.currentLanguageSignal());

  // Version signal to force dirty checking when translation files are loaded
  public version = signal<number>(1);

  // Synchronous pre-populated dictionary to guarantee zero flash of raw keys on refresh/SSR
  private translations: Record<LanguageCode, Record<string, any>> = {
    ta: { ...TA_TRANSLATIONS },
    en: { ...EN_TRANSLATIONS }
  };

  constructor(private http: HttpClient) {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('astro_admin_lang') as LanguageCode;
      if (savedLang === 'ta' || savedLang === 'en') {
        this.currentLanguageSignal.set(savedLang);
      }
    }
    this.loadTranslations('ta');
    this.loadTranslations('en');
  }

  public loadTranslations(lang: LanguageCode): void {
    if (typeof window === 'undefined') return;
    this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        if (data && Object.keys(data).length > 0) {
          this.translations[lang] = { ...this.translations[lang], ...data };
          this.version.update((v) => v + 1);
        }
      },
      error: () => {
        // Built-in dictionaries already active
      }
    });
  }

  public setLanguage(lang: LanguageCode): void {
    this.currentLanguageSignal.set(lang);
    this.version.update((v) => v + 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('astro_admin_lang', lang);
    }
  }

  public toggleLanguage(): void {
    const next = this.currentLanguageSignal() === 'ta' ? 'en' : 'ta';
    this.setLanguage(next);
  }

  public translate(key: string, fallback?: string): string {
    // Reading version creates reactive dependency if inside signal context
    this.version();
    const lang = this.currentLanguageSignal();
    const data = this.translations[lang] || {};
    
    // Support dot-notation keys: e.g. "nav.overview", "services.title"
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

    // Fallback to English if not found in Tamil
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

    // Fallback to Tamil if not found in English
    if (lang !== 'ta' && this.translations['ta']) {
      let taResult: any = this.translations['ta'];
      for (const k of keys) {
        if (taResult && typeof taResult === 'object' && k in taResult) {
          taResult = taResult[k];
        } else {
          taResult = undefined;
          break;
        }
      }
      if (taResult !== undefined && typeof taResult === 'string') {
        return taResult;
      }
    }

    return fallback !== undefined ? fallback : key;
  }

  public t(key: string, fallback?: string): string {
    return this.translate(key, fallback);
  }
}
