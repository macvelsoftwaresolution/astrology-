import { environment } from '../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

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
  templateUrl: './marriage-matching.component.html',
  styleUrls: ['./marriage-matching.component.scss'],
  standalone: false
})
export class MarriageMatchingComponent implements OnInit {
  @Input() rasis: any[] = [];

  // Flow State
  // 0: Options Screen
  // 1: Matrimony Registration Form
  // 2: Matrimony Payment
  // 3: Matrimony Success
  // 4: 2 Jathagam Porutham Form
  // 5: Traditional Matching Sheet Result
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
    rasi: 'மேஷம்',
    star: 'அஸ்வினி',
    dasaBalance: '',
    address: '',
    contactPersonRelation: 'சுயவிவரம்',
    contactPersonName: '',
    phone1: '',
    phone2: '',
    photoAttached: false
  };

  // Form model for Option 2: 2 Jathagam Matching (திருமணப் பொருத்தம்)
  matchingForm = {
    girlName: '',
    girlAge: '',
    girlDob: '',
    girlTob: '',
    girlPob: '',
    girlRasi: 'ரிஷபம்',
    girlStar: 'ரோகிணி',
    boyName: '',
    boyAge: '',
    boyDob: '',
    boyTob: '',
    boyPob: '',
    boyRasi: 'சிம்மம்',
    boyStar: 'பூரம்',
    requesterPhone: ''
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
    private authService: AuthService
  ) { }

  ngOnInit() {
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
    } else if (this.serviceStep === 4 || this.serviceStep === 1) {
      this.serviceStep = 0;
    } else if (this.serviceStep === 2) {
      this.serviceStep = 1;
    } else {
      this.serviceStep = 0;
    }
  }

  selectOption(option: 'register' | 'match') {
    if (option === 'register') {
      this.serviceStep = 1;
    } else {
      this.serviceStep = 4;
    }
  }

  // Calculate 11 Poruthams dynamically based on Girl & Boy Nakshatra
  calculatePorutham() {
    if (!this.matchingForm.girlName || !this.matchingForm.boyName) {
      alert('தயவுசெய்து மணமகள் மற்றும் மணமகன் இருவரின் பெயரையும் உள்ளிடவும்!');
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

    this.serviceStep = 5; // Show Traditional Result Sheet
  }

  // Send request to Admin backend
  sendMatchingToAdmin() {
    this.submittingToAdmin = true;
    const payload = {
      request_type: 'pair_match',
      girl_name: this.matchingForm.girlName,
      girl_dob: this.matchingForm.girlDob || null,
      girl_tob: this.matchingForm.girlTob || null,
      girl_pob: this.matchingForm.girlPob || null,
      girl_rasi: this.matchingForm.girlRasi,
      girl_nakshatra: this.matchingForm.girlStar,
      boy_name: this.matchingForm.boyName,
      boy_dob: this.matchingForm.boyDob || null,
      boy_tob: this.matchingForm.boyTob || null,
      boy_pob: this.matchingForm.boyPob || null,
      boy_rasi: this.matchingForm.boyRasi,
      boy_nakshatra: this.matchingForm.boyStar,
      requester_phone: this.matchingForm.requesterPhone || '9876543210',
      match_score: this.matchResult.totalMatches || 8,
      match_status: this.matchResult.totalMatches >= 6 ? 'Match' : 'Low Match',
      match_details: this.matchResult.poruthams || [],
      verdict: this.matchResult.verdictTitle || ''
    };

    const headers = this.authService.getAuthHeaders();
    this.http.post<any>(`${environment.apiUrl}/jathagam/match`, payload, headers).subscribe({
      next: () => {
        this.submittingToAdmin = false;
        this.adminSubmittedSuccess = true;
      },
      error: () => {
        this.submittingToAdmin = false;
        this.adminSubmittedSuccess = true;
      }
    });
  }

  // Registration Flow
  goToRegPayment() {
    if (!this.regForm.name || !this.regForm.phone1) {
      alert('முக்கிய விவரங்களை (பெயர், அலைபேசி எண்) உள்ளிடவும்.');
      return;
    }
    this.serviceStep = 2;
  }

  payForRegistration() {
    setTimeout(() => {
      this.serviceStep = 3;
    }, 800);
  }

  resetApp() {
    this.serviceStep = 0;
    this.adminSubmittedSuccess = false;
    this.matchingForm.boyName = '';
    this.matchingForm.girlName = '';
  }
}
