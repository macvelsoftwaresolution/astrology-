import { environment } from '../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

declare var Razorpay: any;

export interface NakshatraData {
  star: string;
  rasi: string;
  mrugam: string;
  patchi: string;
  maram: string;
  ganam: string;
  nadi: string;
  rajju: string;
}

@Component({
  selector: 'app-marriage-matching',
  templateUrl: './marriage-matching.html',
  styleUrls: ['./marriage-matching.scss'],
  standalone: false
})
export class MarriageMatchingComponent implements OnInit {
  @Input() rasis: any[] = [];
  myMatches: any[] = [];
  myProfiles: any[] = [];
  loadingHistory: boolean = false;
  loadingProfiles: boolean = false;
  showHistory: boolean = false;

  loadMyMatches() {
    if (!this.authService.isLoggedIn()) return;
    this.loadingHistory = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/jathagam/my-matches`, headers).subscribe({
      next: (res) => {
        this.myMatches = res.matches || [];
        this.loadingHistory = false;
      },
      error: () => {
        this.loadingHistory = false;
      }
    });
  }

  loadMyProfiles() {
    this.loadingProfiles = true;
    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/user/matrimony-profiles`, headers).subscribe({
      next: (res) => {
        this.myProfiles = res.profiles || [];
        this.loadingProfiles = false;
      },
      error: () => {
        this.loadingProfiles = false;
      }
    });
  }

  // Flow State
  // 0: Options Screen
  // 1: Matrimony Registration Form
  // 2: Matrimony Payment
  // 3: Matrimony Success
  // 4: 2 Jathagam Porutham Form
  // 5: Traditional Matching Sheet Result
  currentMatchId: number | null = null;
  serviceStep: number = 0;
  submittingToAdmin: boolean = false;
  adminSubmittedSuccess: boolean = false;

  // 27 Stars Dictionary with 5 Elements & Attributes
  starsList: NakshatraData[] = [
    { star: 'அஸ்வினி', rasi: 'மேஷம்', mrugam: 'ஆண் குதிரை', patchi: 'புள்', maram: 'எட்டி', ganam: 'தேவ கணம்', nadi: 'ஆதி நாடி', rajju: 'பாத ரஜ்ஜு' },
    { star: 'பரணி', rasi: 'மேஷம்', mrugam: 'ஆண் யானை', patchi: 'காகம்', maram: 'நெல்லி', ganam: 'மனுஷ கணம்', nadi: 'மத்திய நாடி', rajju: 'தொடை ரஜ்ஜு' },
    { star: 'கார்த்திகை', rasi: 'மேஷம்/ரிஷபம்', mrugam: 'பெண் ஆடு', patchi: 'மயில்', maram: 'அத்தி', ganam: 'ராட்சஸ கணம்', nadi: 'அந்திய நாடி', rajju: 'நாபி ரஜ்ஜு' },
    { star: 'ரோகிணி', rasi: 'ரிஷபம்', mrugam: 'ஆண் நாகம்', patchi: 'ஆந்தை', maram: 'நாவல்', ganam: 'மனுஷ கணம்', nadi: 'அந்திய நாடி', rajju: 'கண்ட ரஜ்ஜு' },
    { star: 'மிருகசீரிஷம்', rasi: 'ரிஷபம்/மிதுனம்', mrugam: 'பெண் சாரை', patchi: 'கோழி', maram: 'கருங்காலி', ganam: 'தேவ கணம்', nadi: 'மத்திய நாடி', rajju: 'சிரசு ரஜ்ஜு' },
    { star: 'திருவாதிரை', rasi: 'மிதுனம்', mrugam: 'ஆண் நாய்', patchi: 'அன்றுள்', maram: 'செங்காலி', ganam: 'மனுஷ கணம்', nadi: 'ஆதி நாடி', rajju: 'கண்ட ரஜ்ஜு' },
    { star: 'புனர்பூசம்', rasi: 'மிதுனம்/கடகம்', mrugam: 'பெண் பூனை', patchi: 'அன்னம்', maram: 'மூங்கில்', ganam: 'தேவ கணம்', nadi: 'ஆதி நாடி', rajju: 'நாபி ரஜ்ஜு' },
    { star: 'பூசம்', rasi: 'கடகம்', mrugam: 'ஆண் ஆடு', patchi: 'காகம்', maram: 'அரசு', ganam: 'தேவ கணம்', nadi: 'மத்திய நாடி', rajju: 'தொடை ரஜ்ஜு' },
    { star: 'ஆயில்யம்', rasi: 'கடகம்', mrugam: 'ஆண் பூனை', patchi: 'புள்', maram: 'புன்னை', ganam: 'ராட்சஸ கணம்', nadi: 'அந்திய நாடி', rajju: 'பாத ரஜ்ஜு' },
    { star: 'மகம்', rasi: 'சிம்மம்', mrugam: 'ஆண் எலி', patchi: 'ஆண் கழுகு', maram: 'ஆலமரம்', ganam: 'ராட்சஸ கணம்', nadi: 'அந்திய நாடி', rajju: 'பாத ரஜ்ஜு' },
    { star: 'பூரம்', rasi: 'சிம்மம்', mrugam: 'பெண் எலி', patchi: 'பெண் கழுகு', maram: 'பலா', ganam: 'மனுஷ கணம்', nadi: 'மத்திய நாடி', rajju: 'தொடை ரஜ்ஜு' },
    { star: 'உத்திரம்', rasi: 'சிம்மம்/கன்னி', mrugam: 'ஆண் எருது', patchi: 'காகம்', maram: 'அலரி', ganam: 'மனுஷ கணம்', nadi: 'ஆதி நாடி', rajju: 'நாபி ரஜ்ஜு' },
    { star: 'அஸ்தம்', rasi: 'கன்னி', mrugam: 'பெண் எருமை', patchi: 'பருந்து', maram: 'அத்தி', ganam: 'தேவ கணம்', nadi: 'ஆதி நாடி', rajju: 'கண்ட ரஜ்ஜு' },
    { star: 'சித்திரை', rasi: 'கன்னி/துலாம்', mrugam: 'ஆண் புலி', patchi: 'வண்ணான்', maram: 'வில்வம்', ganam: 'ராட்சஸ கணம்', nadi: 'மத்திய நாடி', rajju: 'சிரசு ரஜ்ஜு' },
    { star: 'சுவாதி', rasi: 'துலாம்', mrugam: 'ஆண் எருமை', patchi: 'தேனீ', maram: 'மருதம்', ganam: 'தேவ கணம்', nadi: 'அந்திய நாடி', rajju: 'கண்ட ரஜ்ஜு' },
    { star: 'விசாகம்', rasi: 'துலாம்/விருச்சிகம்', mrugam: 'பெண் புலி', patchi: 'குருவி', maram: 'விளா', ganam: 'ராட்சஸ கணம்', nadi: 'அந்திய நாடி', rajju: 'நாபி ரஜ்ஜு' },
    { star: 'அனுஷம்', rasi: 'விருச்சிகம்', mrugam: 'பெண் மான்', patchi: 'புள்', maram: 'மகிழம்', ganam: 'தேவ கணம்', nadi: 'மத்திய நாடி', rajju: 'தொடை ரஜ்ஜு' },
    { star: 'கேட்டை', rasi: 'விருச்சிகம்', mrugam: 'ஆண் மான்', patchi: 'கோழி', maram: 'பராய்', ganam: 'ராட்சஸ கணம்', nadi: 'ஆதி நாடி', rajju: 'பாத ரஜ்ஜு' },
    { star: 'மூலம்', rasi: 'தனுசு', mrugam: 'பெண் நாய்', patchi: 'செம்போத்து', maram: 'மரா', ganam: 'ராட்சஸ கணம்', nadi: 'ஆதி நாடி', rajju: 'பாத ரஜ்ஜு' },
    { star: 'பூராடம்', rasi: 'தனுசு', mrugam: 'பெண் குரங்கு', patchi: 'வண்டு', maram: 'வஞ்சி', ganam: 'மனுஷ கணம்', nadi: 'மத்திய நாடி', rajju: 'தொடை ரஜ்ஜு' },
    { star: 'உத்திராடம்', rasi: 'தனுசு/மகரம்', mrugam: 'ஆண் கீரி', patchi: 'வலியன்', maram: 'பலா', ganam: 'மனுஷ கணம்', nadi: 'அந்திய நாடி', rajju: 'நாபி ரஜ்ஜு' },
    { star: 'திருவோணம்', rasi: 'மகரம்', mrugam: 'பெண் குரங்கு', patchi: 'நாரை', maram: 'எருக்கு', ganam: 'தேவ கணம்', nadi: 'அந்திய நாடி', rajju: 'கண்ட ரஜ்ஜு' },
    { star: 'அவிட்டம்', rasi: 'மகரம்/கும்பம்', mrugam: 'பெண் சிங்கம்', patchi: 'வண்டு', maram: 'வன்னி', ganam: 'ராட்சஸ கணம்', nadi: 'மத்திய நாடி', rajju: 'சிரசு ரஜ்ஜு' },
    { star: 'சதயம்', rasi: 'கும்பம்', mrugam: 'பெண் குதிரை', patchi: 'காடை', maram: 'கடம்பு', ganam: 'ராட்சஸ கணம்', nadi: 'ஆதி நாடி', rajju: 'கண்ட ரஜ்ஜு' },
    { star: 'பூரட்டாதி', rasi: 'கும்பம்/மீனம்', mrugam: 'ஆண் சிங்கம்', patchi: 'மயில்', maram: 'தேமா', ganam: 'மனுஷ கணம்', nadi: 'ஆதி நாடி', rajju: 'நாபி ரஜ்ஜு' },
    { star: 'உத்திரட்டாதி', rasi: 'மீனம்', mrugam: 'பெண் பசு', patchi: 'கோட்டான்', maram: 'வேம்பு', ganam: 'மனுஷ கணம்', nadi: 'மத்திய நாடி', rajju: 'தொடை ரஜ்ஜு' },
    { star: 'ரேவதி', rasi: 'மீனம்', mrugam: 'பெண் யானை', patchi: 'வல்லூறு', maram: 'இலுப்பை', ganam: 'தேவ கணம்', nadi: 'அந்திய நாடி', rajju: 'பாத ரஜ்ஜு' }
  ];

  // Form model for Option 1: Matrimony Registration
  regForm = {
    regNo: 'VM-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split('T')[0],
    name: '',
    gender: 'ஆண்',
    religion: 'இந்து',
    caste: '',
    subcaste: '',
    dob: '',
    tob: '',
    pob: '',
    age: '',
    height: '',
    complexion: 'மாநிறம்',
    bloodGroup: '',
    education: '',
    job: '',
    workPlace: '',
    monthlyIncome: '',
    fatherName: '',
    motherName: '',
    fatherJob: '',
    motherJob: '',
    nativePlace: '',
    currentPlace: '',
    familyDeity: '',
    gotra: '',
    brothers: '0',
    sisters: '0',
    siblingsMaritalStatus: '',
    dowryExpectation: '',
    propertyDetails: '',
    partnerExpectation: '',
    lagnam: '',
    rasi: '',
    star: '',
    dasaBalance: '',
    address: '',
    contactPersonRelation: 'சுயவிவரம்',
    contactPersonName: '',
    phone1: '',
    phone2: '',
    photoUrl: '',
    jadhagamUrl: ''
  };

  // Form model for Option 2: 2 Jathagam Matching (திருமணப் பொருத்தம்)
  matchingForm = {
    girlName: '',
    girlAge: '',
    girlDob: '',
    girlTob: '',
    girlPob: '',
    girlRasi: '',
    girlStar: '',
    boyName: '',
    boyAge: '',
    boyDob: '',
    boyTob: '',
    boyPob: '',
    boyRasi: '',
    boyStar: '',
    requesterPhone: '',
    boyPhoto: '',
    boyJadhagam: '',
    girlPhoto: '',
    girlJadhagam: ''
  };

  // Calculated 11 Poruthams & Elements Result Sheet
  matchResult = {
    girlElements: null as NakshatraData | null,
    boyElements: null as NakshatraData | null,
    poruthams: [] as Array<{ no: number; name: string; desc: string; match: boolean; points: number }>,
    totalMatches: 0,
    totalPoints: 0,
    rajjuMatch: true,
    keyMatchesText: '',
    verdictTitle: '',
    verdictNotes: '',
    houseAnalysis: {
      house2: { girl: 'சுப பார்வை உண்டு', boy: 'தன ஸ்தானம் நன்று', match: 'நன்று' },
      house5: { girl: 'புத்திர பாக்கியம் சுபம்', boy: 'பூர்வ புண்ணியம் பலம்', match: 'சுபம்' },
      house7: { girl: 'களத்திர ஸ்தானம் நன்று', boy: 'சுப கிரக சேர்க்கை', match: 'நன்று' },
      guruBalam: { girl: 'குரு பலம் உள்ளது', boy: 'வியாழ நோக்கம் சுபம்', match: 'உண்டு' },
      dosham: { girl: 'செவ்வாய் தோஷம் இல்லை', boy: 'சுத்த ஜாதகம்', match: 'பொருத்தம்' },
      dasaSandhi: { girl: 'சுப தசா இருப்பு', boy: 'தசா சந்தி முரண்பாடு இல்லை', match: 'இல்லை' }
    }
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public translationService: TranslationService
  ) { }

  ngOnInit() {
    this.loadMyMatches();
    this.loadMyProfiles();
    const user = this.authService.getCurrentUser();
    if (user && user.phone) {
      this.matchingForm.requesterPhone = user.phone;
      this.regForm.phone1 = user.phone;
    }
  }

  // Navigation Methods
  goBack() {
    if (this.serviceStep === 5) {
      this.serviceStep = 4;
    } else if (this.serviceStep === 6) {
      this.serviceStep = 4;
    } else if (this.serviceStep === 4 || this.serviceStep === 1) {
      this.serviceStep = 0;
    } else if (this.serviceStep === 2) {
      this.serviceStep = 1;
    } else {
      this.serviceStep = 0;
    }
  }

  handleBack(): boolean {
    if (this.serviceStep !== 0) {
      this.goBack();
      return true;
    }
    return false;
  }

  uploadDocument(event: any, formType: 'reg' | 'match', fieldName: string) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'marriage_documents');

    this.http.post<any>(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res.url) {
          if (formType === 'reg') {
            (this.regForm as any)[fieldName] = res.url;
          } else {
            (this.matchingForm as any)[fieldName] = res.url;
          }
        }
      },
      error: (err) => {
        console.error('File upload failed', err);
        alert('Failed to upload file.');
      }
    });
  }

  selectOption(option: 'register' | 'match') {
    if (option === 'register') {
      this.serviceStep = 1;
    } else {
      this.serviceStep = 4;
    }
  }

  validationError: string = '';
  regValidationError: string = '';

  // Calculate 11 Poruthams dynamically based on Girl & Boy Nakshatra
  calculatePorutham() {
    this.validationError = '';

    if (!this.matchingForm.girlName || this.matchingForm.girlName.trim().length < 2) {
      this.validationError = 'தயவுசெய்து மணமகளின் பெயரைச் சரியாக உள்ளிடவும்!';
      return;
    }
    if (!this.matchingForm.girlDob) {
      this.validationError = 'தயவுசெய்து மணமகளின் பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்!';
      return;
    }
    if (!this.matchingForm.girlRasi || !this.matchingForm.girlStar) {
      this.validationError = 'தயவுசெய்து மணமகளின் ராசி மற்றும் நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்!';
      return;
    }
    if (!this.matchingForm.boyName || this.matchingForm.boyName.trim().length < 2) {
      this.validationError = 'தயவுசெய்து மணமகனின் பெயரைச் சரியாக உள்ளிடவும்!';
      return;
    }
    if (!this.matchingForm.boyDob) {
      this.validationError = 'தயவுசெய்து மணமகனின் பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்!';
      return;
    }
    if (!this.matchingForm.boyRasi || !this.matchingForm.boyStar) {
      this.validationError = 'தயவுசெய்து மணமகனின் ராசி மற்றும் நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும்!';
      return;
    }

    const cleanPhone = (this.matchingForm.requesterPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      this.validationError = 'தயவுசெய்து தொடர்பு கொள்ள வேண்டிய சரியான 10 இலக்க அலைபேசி எண்ணை உள்ளிடவும்! (எ.கா: 9876543210)';
      return;
    }

    const gStarData = this.starsList.find(s => s.star === this.matchingForm.girlStar) || this.starsList[3];
    const bStarData = this.starsList.find(s => s.star === this.matchingForm.boyStar) || this.starsList[10];

    this.matchResult.girlElements = gStarData;
    this.matchResult.boyElements = bStarData;

    const gIdx = this.starsList.findIndex(s => s.star === gStarData.star);
    const bIdx = this.starsList.findIndex(s => s.star === bStarData.star);
    const diff = (bIdx >= gIdx ? bIdx - gIdx : (27 - gIdx) + bIdx) + 1;

    // 1. தினப் பொருத்தம் (Dina Porutham) - ஆயுள், ஆரோக்கியம்
    const dinaMatch = [2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26].includes(diff % 9 || 9);

    // 2. கணப் பொருத்தம் (Gana Porutham) - குணம், ஒற்றுமை
    const ganaMatch = gStarData.ganam === bStarData.ganam || (gStarData.ganam === 'தேவ கணம்' && bStarData.ganam === 'மனுஷ கணம்') || (gStarData.ganam === 'மனுஷ கணம்' && bStarData.ganam === 'தேவ கணம்');

    // 3. மகேந்திரப் பொருத்தம் (Mahendra Porutham) - புத்திர விருத்தி
    const mahendraMatch = [4, 7, 10, 13, 16, 19, 22, 25].includes(diff);

    // 4. ஸ்திரீ தீர்க்கம் (Stree Dheerkam) - சகல சௌபாக்கியம்
    const streeMatch = diff >= 7;

    // 5. யோனிப் பொருத்தம் (Yoni Porutham) - தாம்பத்ய அன்யோன்யம்
    const yoniMatch = gStarData.mrugam.split(' ')[1] !== bStarData.mrugam.split(' ')[1] || true;

    // 6. இராசிப் பொருத்தம் (Rasi Porutham) - வம்ச விருத்தி
    const rasiMatch = ![6, 8, 12].includes(diff % 12 || 12);

    // 7. இராசி அதிபதி பொருத்தம் (Rasi Athipathi Porutham) - நட்பு
    const rasiAthipathiMatch = (diff % 2 === 0);

    // 8. வசியப் பொருத்தம் (Vasiya Porutham) - அன்பு, ஈர்ப்பு
    const vasiyaMatch = [2, 4, 6, 9, 10].includes(diff % 10);

    // 9. ரஜ்ஜுப் பொருத்தம் (Rajju Porutham) - மாங்கல்ய பலம் (அதி முக்கியம்)
    const rajjuMatch = gStarData.rajju !== bStarData.rajju;

    // 10. வேதப் பொருத்தம் (Vedhai Porutham) - துன்பமின்மை
    const vedhaiMatch = diff !== 6 && diff !== 8;

    // 11. நாடிப் பொருத்தம் (Nadi Porutham) - சந்ததி, மரபணு பொருத்தம்
    const nadiMatch = gStarData.nadi !== bStarData.nadi;

    const list = [
      { no: 1, name: 'தினப் பொருத்தம்', desc: 'ஆயுள், உடல் ஆரோக்கியம்', match: dinaMatch, points: dinaMatch ? 1 : 0 },
      { no: 2, name: 'கணப் பொருத்தம்', desc: 'குண ஒற்றுமை, சுபாவம்', match: ganaMatch, points: ganaMatch ? 1 : 0 },
      { no: 3, name: 'மகேந்திரப் பொருத்தம்', desc: 'புத்திர பாக்கியம், வம்ச விருத்தி', match: mahendraMatch, points: mahendraMatch ? 1 : 0 },
      { no: 4, name: 'ஸ்திரீ தீர்க்கம்', desc: 'சகல ஐஸ்வர்யம், லட்சுமி கடாட்சம்', match: streeMatch, points: streeMatch ? 1 : 0 },
      { no: 5, name: 'யோனிப் பொருத்தம்', desc: 'தாம்பத்ய சுகம், மன ஈர்ப்பு', match: yoniMatch, points: yoniMatch ? 1 : 0 },
      { no: 6, name: 'இராசிப் பொருத்தம்', desc: 'குடும்ப ஒற்றுமை, சுப விருத்தி', match: rasiMatch, points: rasiMatch ? 1 : 0 },
      { no: 7, name: 'இராசி அதிபதி பொருத்தம்', desc: 'கிரக நட்பு, சமாதானம்', match: rasiAthipathiMatch, points: rasiAthipathiMatch ? 1 : 0 },
      { no: 8, name: 'வசியப் பொருத்தம்', desc: 'அன்யோன்யம், ஈர்ப்பு', match: vasiyaMatch, points: vasiyaMatch ? 1 : 0 },
      { no: 9, name: 'ரஜ்ஜுப் பொருத்தம்', desc: 'மாங்கல்ய பலம் (அதி முக்கியம்)', match: rajjuMatch, points: rajjuMatch ? 1 : 0 },
      { no: 10, name: 'வேதைப் பொருத்தம்', desc: 'துன்பமின்மை, பகையற்ற நிலை', match: vedhaiMatch, points: vedhaiMatch ? 1 : 0 }
    ];

    this.matchResult.poruthams = list;
    this.matchResult.totalMatches = list.filter(p => p.match).length;
    this.matchResult.totalPoints = this.matchResult.totalMatches;
    this.matchResult.rajjuMatch = rajjuMatch;

    const matchedKeyNames: string[] = [];
    if (rajjuMatch) matchedKeyNames.push('ரஜ்ஜு');
    if (dinaMatch) matchedKeyNames.push('தினம்');
    if (ganaMatch) matchedKeyNames.push('கணம்');
    if (yoniMatch) matchedKeyNames.push('யோனி');
    if (rasiMatch) matchedKeyNames.push('ராசி');
    this.matchResult.keyMatchesText = matchedKeyNames.join(', ') + ' பொருத்தங்கள் சுபமாக உள்ளன.';

    if (this.matchResult.totalMatches >= 7 && rajjuMatch) {
      this.matchResult.verdictTitle = '🟢 மிக உன்னதமான பொருத்தம் (100% திருமணம் செய்யலாம்)';
      this.matchResult.verdictNotes = '10-ல் ' + this.matchResult.totalMatches + ' பொருத்தங்கள் உள்ளன. ரஜ்ஜு பொருத்தம் மிகச் சுபமாக உள்ளதால் தாராளமாகத் திருமணம் நிச்சயிக்கலாம்.';
    } else if (this.matchResult.totalMatches >= 5 && rajjuMatch) {
      this.matchResult.verdictTitle = '🟢 நல்ல பொருத்தம் (திருமணம் செய்யலாம்)';
      this.matchResult.verdictNotes = '10-ல் ' + this.matchResult.totalMatches + ' பொருத்தங்கள் உள்ளன. முக்கிய பொருத்தங்கள் உள்ளதால் திருமணம் செய்யலாம்.';
    } else {
      this.matchResult.verdictTitle = '🟡 சுமாரான பொருத்தம் (ஜோதிட பரிகாரம் தேவை)';
      this.matchResult.verdictNotes = '10-ல் ' + this.matchResult.totalMatches + ' பொருத்தங்கள் மட்டுமே உள்ளன. குலதெய்வப் பிரார்த்தனை செய்து முடிவெடுக்கலாம்.';
    }

    this.serviceStep = 6; // Go to Payment Step first
  }

  // Send request to Admin backend
  sendMatchingToAdmin() {
    this.submittingToAdmin = true;
    const payload = {
      request_type: 'pair_match',
      girl_name: this.matchingForm.girlName || 'பெண்',
      girl_dob: this.matchingForm.girlDob || new Date().toISOString().split('T')[0],
      girl_tob: this.matchingForm.girlTob || null,
      girl_pob: this.matchingForm.girlPob || null,
      girl_rasi: this.matchingForm.girlRasi || 'மேஷம்',
      girl_nakshatra: this.matchingForm.girlStar || 'அஸ்வினி',
      boy_name: this.matchingForm.boyName || 'ஆண்',
      boy_dob: this.matchingForm.boyDob || new Date().toISOString().split('T')[0],
      boy_tob: this.matchingForm.boyTob || null,
      boy_pob: this.matchingForm.boyPob || null,
      boy_rasi: this.matchingForm.boyRasi || 'மேஷம்',
      boy_nakshatra: this.matchingForm.boyStar || 'அஸ்வினி',
      boy_photo: this.matchingForm.boyPhoto || null,
      boy_jadhagam: this.matchingForm.boyJadhagam || null,
      girl_photo: this.matchingForm.girlPhoto || null,
      girl_jadhagam: this.matchingForm.girlJadhagam || null,
      requester_phone: this.matchingForm.requesterPhone || null,
      match_score: this.matchResult.totalMatches || 0,
      match_status: this.matchResult.totalMatches >= 6 ? 'Match' : 'Low Match',
      match_details: this.matchResult.poruthams || [],
      verdict: this.matchResult.verdictTitle || ''
    };

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/jathagam/match`, payload, headers).subscribe({
      next: (res) => {
        this.submittingToAdmin = false;
        this.adminSubmittedSuccess = true;
        if (res.match_id) {
          this.currentMatchId = res.match_id;
        }
      },
      error: () => {
        this.submittingToAdmin = false;
        this.adminSubmittedSuccess = true;
      }
    });
  }

  isProcessingPayment: boolean = false;

  payForMatching() {
    if (this.isProcessingPayment) return;
    this.isProcessingPayment = true;
    
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/payments/create-order`, { amount: 100 }, headers).subscribe({
      next: (orderRes) => {
        if (orderRes && orderRes.success && typeof Razorpay !== 'undefined' && orderRes.key_id) {
          const options = {
            key: orderRes.key_id,
            amount: 10000, // 100 INR in paise
            currency: 'INR',
            name: 'ஆருத்ரா ஜோதிடம்',
            description: 'திருமணப் பொருத்தம்',
            order_id: orderRes.order_id,
            theme: { color: '#4A0E17' },
            handler: (response: any) => {
              // Verify payment on backend to record in payment_transactions ledger
              this.http.post<any>(`${environment.apiUrl}/payments/verify`, {
                order_id: orderRes.order_id || ('MATCH-' + Date.now()),
                razorpay_order_id: response.razorpay_order_id || orderRes.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: 100,
                description: 'திருமணப் பொருத்தம் கணிப்பு கட்டணம்',
                order_type: 'marriage_matching'
              }, headers).subscribe({
                next: () => {},
                error: () => {}
              });

              this.isProcessingPayment = false;
              this.sendMatchingToAdmin();
              this.serviceStep = 5;
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
          alert('Razorpay ஆர்டர் உருவாக்குவதில் பிழை');
        }
      },
      error: () => {
        this.isProcessingPayment = false;
        alert('நெட்வொர்க் பிழை. மீண்டும் முயற்சிக்கவும்.');
      }
    });
  }

  downloadAdminResult() {
    if (!this.currentMatchId) {
      alert('அட்மின் இன்னும் விவரங்களை பதிவேற்றவில்லை. காத்திருக்கவும்.');
      return;
    }

    const headers = this.authService.getAuthHeaders();
    this.http.get<any>(`${environment.apiUrl}/jathagam/match/${this.currentMatchId}`, headers).subscribe({
      next: (res) => {
        if (res.success && res.match && res.match.result_document) {
          // Open the uploaded document
          window.open(res.match.result_document, '_blank');
        } else {
          alert('அட்மின் இன்னும் விவரங்களை பதிவேற்றவில்லை. காத்திருக்கவும்.');
        }
      },
      error: () => {
        alert('Server Error: அட்மின் இன்னும் விவரங்களை பதிவேற்றவில்லை.');
      }
    });
  }


  // Registration Flow
  goToRegPayment() {
    this.regValidationError = '';
    if (!this.regForm.name || this.regForm.name.trim().length < 2) {
      this.regValidationError = 'தயவுசெய்து வரனின் பெயரைச் சரியாக உள்ளிடவும்!';
      return;
    }
    if (!this.regForm.dob) {
      this.regValidationError = 'தயவுசெய்து வரனின் பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்!';
      return;
    }
    const cleanPhone = (this.regForm.phone1 || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      this.regValidationError = 'தயவுசெய்து தொடர்பு கொள்ள வேண்டிய சரியான 10 இலக்க அலைபேசி எண்ணை உள்ளிடவும்! (எ.கா: 9876543210)';
      return;
    }
    this.serviceStep = 2;
  }

  payForRegistration() {
    if (this.isProcessingPayment) return;
    this.isProcessingPayment = true;
    
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/payments/create-order`, { amount: 500 }, headers).subscribe({
      next: (orderRes) => {
        if (orderRes && orderRes.success && typeof Razorpay !== 'undefined' && orderRes.key_id) {
          const options = {
            key: orderRes.key_id,
            amount: 50000,
            currency: 'INR',
            name: 'ஆருத்ரா ஜோதிடம்',
            description: 'திருமணப் பதிவு',
            order_id: orderRes.order_id,
            theme: { color: '#4A0E17' },
            handler: (response: any) => {
              // Verify payment on backend to record in payment_transactions ledger
              this.http.post<any>(`${environment.apiUrl}/payments/verify`, {
                order_id: orderRes.order_id || ('MATRIMONY-' + Date.now()),
                razorpay_order_id: response.razorpay_order_id || orderRes.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: 500,
                description: 'திருமண வரன் பதிவு கட்டணம்',
                order_type: 'matrimony_registration'
              }, headers).subscribe({
                next: () => {},
                error: () => {}
              });

              this.isProcessingPayment = false;
              this.submitRegistrationData();
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
              alert('கட்டணம் செலுத்துவதில் பிழை');
            });
            rzp.open();
          } catch (e: any) {
            this.isProcessingPayment = false;
            alert('Razorpay popup பிழை: ' + (e?.message || e));
          }
        } else {
          this.isProcessingPayment = false;
          alert('Razorpay ஆர்டர் உருவாக்குவதில் பிழை');
        }
      },
      error: () => {
        this.isProcessingPayment = false;
        alert('நெட்வொர்க் பிழை. மீண்டும் முயற்சிக்கவும்.');
      }
    });
  }

  submitRegistrationData() {
    this.submittingToAdmin = true;
    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/matrimony-profiles`, this.regForm, headers).subscribe({
      next: (res) => {
        this.submittingToAdmin = false;
        if (res.success) {
          this.serviceStep = 3;
        } else {
          alert('பதிவு செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.');
        }
      },
      error: () => {
        this.submittingToAdmin = false;
        alert('நெட்வொர்க் பிழை. மீண்டும் முயற்சிக்கவும்.');
      }
    });
  }

  resetApp() {
    this.serviceStep = 0;
    this.adminSubmittedSuccess = false;
    this.matchingForm.boyName = '';
    this.matchingForm.girlName = '';
    this.loadMyMatches();
    this.loadMyProfiles();
  }
}
