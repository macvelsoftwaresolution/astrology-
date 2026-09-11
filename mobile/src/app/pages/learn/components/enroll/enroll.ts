import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { TranslationService } from '../../../../services/translation.service';

@Component({
  selector: 'app-learn-enroll',
  templateUrl: './enroll.html',
  styleUrls: ['./enroll.scss'],
  standalone: false
})
export class LearnEnrollComponent implements OnInit {
  @Input() form: any;
  @Output() next = new EventEmitter<any>();

  private authService = inject(AuthService);
  public translationService = inject(TranslationService);

  ilanilaiSearchQuery: string = '';

  cleanBatchName(name: string): string {
    if (!name) return '';
    const isTa = this.translationService.currentLanguage() === 'ta';
    let str = name;
    if (isTa) {
      str = str.replace(/Batch\s*1/gi, 'பிரிவு 1')
               .replace(/Batch\s*2/gi, 'பிரிவு 2')
               .replace(/Batch\s*3/gi, 'பிரிவு 3')
               .replace(/Batch\s*4/gi, 'பிரிவு 4')
               .replace(/Jan\s*-\s*Mar/gi, 'ஜன - மார்')
               .replace(/Apr\s*-\s*Jun/gi, 'ஏப் - ஜூன்')
               .replace(/Jul\s*-\s*Sep/gi, 'ஜூலை - செப்')
               .replace(/Oct\s*-\s*Dec/gi, 'அக் - டிச');
    }
    return str;
  }
  isFetchingIlanilai: boolean = false;
  fetchSuccessMsg: string = '';
  fetchErrorMsg: string = '';
  availableBatches: any[] = [];
  activeBatchName: string = '';

  localForm: any = {
    // Basic & Tamil/English Names
    studentNameTamil: '',
    fullName: '', // Name in English
    fatherName: '',
    dob: '',
    gender: 'ஆண்',
    age: '',
    occupation: '',
    motherTongue: 'தமிழ்',
    
    // Address & Contact
    postalAddress: '',
    pincode: '',
    mobileNumber: '',
    altMobileNumber: '',
    emailAddress: '',
    
    // Qualification & Course Preferences
    qualification: '',
    courseLevel: 'ilanilai',
    trainingPurpose: 'தொழிலாக கொள்ள',
    batch_id: null as number | null,
    batch_name: '',
    studentPhoto: '',
    
    // Mudhunilai specific fields
    prevCertificate: '',
    completionYear: '',
    prevMarks: '',
    prevUserId: '',
    
    // Declaration
    agreedDeclaration: true
  };

  errorMessage: string = '';

  dobDay: string = '';
  dobMonth: string = '';
  dobYear: string = '';
  dobError: string = '';

  ngOnInit() {
    if (this.form) {
      this.localForm = {
        ...this.localForm,
        ...this.form
      };
      if (this.localForm.prevUserId) {
        this.ilanilaiSearchQuery = this.localForm.prevUserId;
      }
    }
    if (this.localForm.dob) {
      this.syncSegmentsFromIso(this.localForm.dob);
    }
    this.loadBatches();
  }

  syncSegmentsFromIso(isoDate: string) {
    if (!isoDate) {
      this.dobDay = '';
      this.dobMonth = '';
      this.dobYear = '';
      return;
    }
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      this.dobYear = parts[0];
      this.dobMonth = parts[1];
      this.dobDay = parts[2];
      this.validateDobSegments(false);
    }
  }

  validateDobSegments(markError: boolean = false): boolean {
    const isTa = this.translationService.currentLanguage() === 'ta';
    const dStr = (this.dobDay || '').trim();
    const mStr = (this.dobMonth || '').trim();
    const yStr = (this.dobYear || '').trim();

    // 1. If empty
    if (!dStr && !mStr && !yStr) {
      if (markError) {
        this.dobError = isTa ? 'பிறந்த தேதி கட்டாயம் உள்ளிட வேண்டும்.' : 'Date of birth is required.';
      } else {
        this.dobError = '';
      }
      this.localForm.dob = '';
      this.localForm.age = '';
      return false;
    }

    // Check Day range immediately if entered
    if (dStr) {
      const dNum = parseInt(dStr, 10);
      if (!isNaN(dNum)) {
        if (dNum > 31 || (dStr.length === 2 && dNum < 1)) {
          this.dobError = isTa ? 'தேதி 1 முதல் 31 வரை மட்டுமே இருக்க வேண்டும் (DD).' : 'Day must be between 1 and 31 (DD).';
          this.localForm.dob = '';
          this.localForm.age = '';
          return false;
        }
      }
    }

    // Check Month range immediately if entered
    if (mStr) {
      const mNum = parseInt(mStr, 10);
      if (!isNaN(mNum)) {
        if (mNum > 12 || (mStr.length === 2 && mNum < 1)) {
          this.dobError = isTa ? 'மாதம் 1 முதல் 12 வரை மட்டுமே இருக்க வேண்டும் (MM).' : 'Month must be between 1 and 12 (MM).';
          this.localForm.dob = '';
          this.localForm.age = '';
          return false;
        }
      }
    }

    // Check Year immediately if entered
    const currentYear = new Date().getFullYear();
    if (yStr && yStr.length === 4) {
      const yNum = parseInt(yStr, 10);
      if (!isNaN(yNum) && yNum > currentYear) {
        this.dobError = isTa ? `பிறந்த வருடம் நடப்பு வருடத்திற்குள் (${currentYear}) மட்டுமே இருக்க வேண்டும்.` : `Birth year cannot exceed current year (${currentYear}).`;
        this.localForm.dob = '';
        this.localForm.age = '';
        return false;
      }
    }

    // 2. Incomplete input check
    if (!dStr || !mStr || !yStr || yStr.length < 4) {
      if (markError || (dStr && !mStr && yStr.length === 4) || (dStr && mStr && yStr.length > 0 && yStr.length < 4)) {
        if (!mStr && dStr && yStr) {
          this.dobError = isTa ? 'மாதம் (MM) உள்ளிடப்படவில்லை. பிறந்த தேதியை முழுமையாக உள்ளிடவும்.' : 'Month is missing. Please enter full DOB (DD/MM/YYYY).';
        } else if (!dStr) {
          this.dobError = isTa ? 'தேதி (DD) உள்ளிடப்படவில்லை. பிறந்த தேதியை முழுமையாக உள்ளிடவும்.' : 'Day is missing. Please enter full DOB (DD/MM/YYYY).';
        } else if (yStr.length < 4) {
          this.dobError = isTa ? 'வருடம் 4 இலக்கங்களில் இருக்க வேண்டும் (உதா: 2004).' : 'Year must be 4 digits (e.g. 2004).';
        } else {
          this.dobError = isTa ? 'பிறந்த தேதியை முழுமையாக உள்ளிடவும் (DD / MM / YYYY).' : 'Please enter full DOB (DD / MM / YYYY).';
        }
      } else {
        this.dobError = '';
      }
      this.localForm.dob = '';
      this.localForm.age = '';
      return false;
    }

    const d = parseInt(dStr, 10);
    const m = parseInt(mStr, 10);
    const y = parseInt(yStr, 10);

    // 3. Day & Month ranges
    if (isNaN(d) || d < 1 || d > 31) {
      this.dobError = isTa ? 'தேதி 1 முதல் 31 வரை மட்டுமே இருக்க வேண்டும் (DD).' : 'Day must be between 1 and 31 (DD).';
      this.localForm.dob = '';
      this.localForm.age = '';
      return false;
    }

    if (isNaN(m) || m < 1 || m > 12) {
      this.dobError = isTa ? 'மாதம் 1 முதல் 12 வரை மட்டுமே இருக்க வேண்டும் (MM).' : 'Month must be between 1 and 12 (MM).';
      this.localForm.dob = '';
      this.localForm.age = '';
      return false;
    }

    if (isNaN(y) || y < 1920 || y > currentYear) {
      if (y > currentYear) {
        this.dobError = isTa ? `பிறந்த வருடம் நடப்பு வருடத்திற்குள் (${currentYear}) மட்டுமே இருக்க வேண்டும்.` : `Birth year cannot exceed current year (${currentYear}).`;
      } else {
        this.dobError = isTa ? `சரியான வருடத்தை உள்ளிடவும் (1920 முதல் ${currentYear} வரை).` : `Enter valid year (1920 to ${currentYear}).`;
      }
      this.localForm.dob = '';
      this.localForm.age = '';
      return false;
    }

    // 4. Valid calendar date (e.g. leap year, 30 vs 31 days)
    const birthDate = new Date(y, m - 1, d);
    if (birthDate.getFullYear() !== y || birthDate.getMonth() !== (m - 1) || birthDate.getDate() !== d) {
      this.dobError = isTa ? 'செல்லுபடியாகாத தேதி (நாட்களின் எண்ணிக்கை தவறாக உள்ளது).' : 'Invalid calendar date. Please check day and month.';
      this.localForm.dob = '';
      this.localForm.age = '';
      return false;
    }

    // 5. Future date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birthDate > today) {
      this.dobError = isTa ? 'பிறந்த தேதி எதிர்காலத்தில் இருக்கக்கூடாது.' : 'Date of birth cannot be in the future.';
      this.localForm.dob = '';
      this.localForm.age = '';
      return false;
    }

    // 6. Age calculation
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 5) {
      this.dobError = isTa ? 'மாணவர் வயது குறைந்தது 5 ஆக இருக்க வேண்டும்.' : 'Student must be at least 5 years old.';
      this.localForm.dob = '';
      this.localForm.age = '';
      return false;
    }

    // Valid date and age
    this.dobError = '';
    const dd = String(d).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    this.localForm.dob = `${y}-${mm}-${dd}`;
    this.localForm.age = age.toString();
    return true;
  }

  onDayInput(event: any, monthInput: HTMLInputElement) {
    let val = (event.target.value || '').replace(/\D/g, '').slice(0, 2);
    if (val.length === 2) {
      const dNum = parseInt(val, 10);
      if (dNum > 31) {
        val = '31';
      } else if (dNum === 0) {
        val = '01';
      }
    } else if (val.length === 1 && parseInt(val, 10) > 3) {
      val = '0' + val;
      this.dobDay = val;
      if (monthInput) monthInput.focus();
      this.validateDobSegments(false);
      return;
    }
    this.dobDay = val;
    if (val.length === 2 && monthInput) {
      monthInput.focus();
    }
    this.validateDobSegments(false);
  }

  onDayBlur() {
    if (this.dobDay) {
      const dNum = parseInt(this.dobDay, 10);
      if (isNaN(dNum) || dNum < 1 || dNum > 31) {
        const isTa = this.translationService.currentLanguage() === 'ta';
        this.dobError = isTa ? 'தேதி 1 முதல் 31 வரை மட்டுமே இருக்க வேண்டும் (DD).' : 'Day must be between 1 and 31 (DD).';
        return;
      }
      if (this.dobDay.length === 1) {
        this.dobDay = '0' + this.dobDay;
      }
    }
    this.validateDobSegments(false);
  }

  onMonthInput(event: any, yearInput: HTMLInputElement) {
    let val = (event.target.value || '').replace(/\D/g, '').slice(0, 2);
    if (val.length === 2) {
      const mNum = parseInt(val, 10);
      if (mNum > 12) {
        val = '12';
      } else if (mNum === 0) {
        val = '01';
      }
    } else if (val.length === 1 && parseInt(val, 10) > 1) {
      val = '0' + val;
      this.dobMonth = val;
      if (yearInput) yearInput.focus();
      this.validateDobSegments(false);
      return;
    }
    this.dobMonth = val;
    if (val.length === 2 && yearInput) {
      yearInput.focus();
    }
    this.validateDobSegments(false);
  }

  onMonthBlur() {
    if (this.dobMonth) {
      const mNum = parseInt(this.dobMonth, 10);
      if (isNaN(mNum) || mNum < 1 || mNum > 12) {
        const isTa = this.translationService.currentLanguage() === 'ta';
        this.dobError = isTa ? 'மாதம் 1 முதல் 12 வரை மட்டுமே இருக்க வேண்டும் (MM).' : 'Month must be between 1 and 12 (MM).';
        return;
      }
      if (this.dobMonth.length === 1) {
        this.dobMonth = '0' + this.dobMonth;
      }
    }
    this.validateDobSegments(false);
  }

  onMonthKeydown(event: KeyboardEvent, dayInput: HTMLInputElement) {
    if (event.key === 'Backspace' && !this.dobMonth && dayInput) {
      dayInput.focus();
    }
  }

  onYearInput(event: any) {
    let val = (event.target.value || '').replace(/\D/g, '').slice(0, 4);
    const currentYear = new Date().getFullYear();
    const curYearPrefix3 = Math.floor(currentYear / 10);
    const curYearPrefix1 = Math.floor(currentYear / 1000);

    // Prevent typing higher prefixes for the current era
    if (val.length === 1 && parseInt(val, 10) > curYearPrefix1) {
      val = curYearPrefix1.toString();
      if (event?.target) event.target.value = val;
    } else if (val.length === 3 && parseInt(val, 10) > curYearPrefix3) {
      val = curYearPrefix3.toString();
      if (event?.target) event.target.value = val;
    } else if (val.length === 4) {
      const yNum = parseInt(val, 10);
      if (yNum > currentYear) {
        val = currentYear.toString();
        if (event?.target) event.target.value = val;
      }
    }

    this.dobYear = val;
    this.validateDobSegments(false);
  }

  onYearBlur() {
    if (this.dobYear) {
      const currentYear = new Date().getFullYear();
      const yNum = parseInt(this.dobYear, 10);
      if (!isNaN(yNum) && yNum > currentYear) {
        this.dobYear = currentYear.toString();
      }
    }
    this.validateDobSegments(false);
  }

  onYearKeydown(event: KeyboardEvent, monthInput: HTMLInputElement) {
    if (event.key === 'Backspace' && !this.dobYear && monthInput) {
      monthInput.focus();
    }
  }

  loadBatches() {
    this.authService.getPublicBatches().subscribe({
      next: (res: any) => {
        if (res && res.success && res.batches && res.batches.length > 0) {
          this.availableBatches = res.batches;
          // Auto select first active batch or default quarter batch
          const active = res.batches.find((b: any) => b.status === 'active') || res.batches[0];
          if (active && !this.localForm.batch_id) {
            this.localForm.batch_id = active.id;
            this.localForm.batch_name = active.name;
            this.activeBatchName = active.name;
          }
        }
      },
      error: () => {}
    });
  }

  setCourseLevel(level: 'ilanilai' | 'mudhunilai') {
    this.localForm.courseLevel = level;
    this.fetchSuccessMsg = '';
    this.fetchErrorMsg = '';
  }

  fetchIlanilaiDetails() {
    const query = (this.ilanilaiSearchQuery || this.localForm.prevUserId || '').trim();
    if (!query) {
      this.fetchErrorMsg = 'errors.fillIlanilaiId';
      this.fetchSuccessMsg = '';
      return;
    }

    this.isFetchingIlanilai = true;
    this.fetchErrorMsg = '';
    this.fetchSuccessMsg = '';

    this.authService.fetchStudentDetails(query).subscribe({
      next: (res: any) => {
        this.isFetchingIlanilai = false;
        if (res && res.success && res.student) {
          const s = res.student;
          this.localForm.prevUserId = s.prevUserId || query;
          this.localForm.studentNameTamil = s.studentNameTamil || this.localForm.studentNameTamil;
          this.localForm.fullName = s.fullName || this.localForm.fullName;
          this.localForm.fatherName = s.fatherName || this.localForm.fatherName;
          this.localForm.dob = s.dob || this.localForm.dob;
          if (this.localForm.dob) {
            this.syncSegmentsFromIso(this.localForm.dob);
          }
          this.localForm.gender = s.gender || this.localForm.gender;
          this.localForm.age = s.age || this.localForm.age;
          this.localForm.occupation = s.occupation || this.localForm.occupation;
          this.localForm.motherTongue = s.motherTongue || this.localForm.motherTongue;
          this.localForm.postalAddress = s.postalAddress || this.localForm.postalAddress;
          this.localForm.pincode = s.pincode || this.localForm.pincode;
          this.localForm.mobileNumber = s.mobileNumber || this.localForm.mobileNumber;
          this.localForm.altMobileNumber = s.altMobileNumber || this.localForm.altMobileNumber;
          this.localForm.emailAddress = s.emailAddress || this.localForm.emailAddress;
          this.localForm.qualification = s.qualification || this.localForm.qualification;
          this.localForm.completionYear = s.completionYear || this.localForm.completionYear;
          this.localForm.prevMarks = s.prevMarks || this.localForm.prevMarks;
          this.localForm.prevCertificate = s.prevCertificate || this.localForm.prevCertificate;

          this.calculateAge();
          this.fetchSuccessMsg = 'இளநிலை மாணவர் விவரங்கள் வெற்றிகரமாக மீட்டெடுக்கப்பட்டு படிவத்தில் நிரப்பப்பட்டன!';
        } else {
          this.fetchErrorMsg = 'விவரங்கள் எதுவும் கிடைக்கவில்லை. கைமுறையாக உள்ளிடலாம்.';
        }
      },
      error: (err: any) => {
        this.isFetchingIlanilai = false;
        this.fetchErrorMsg = err?.error?.message || 'மாணவர் ஐடி கிடைக்கவில்லை. தயவுசெய்து சரியான ஐடி உள்ளிடவும் அல்லது கீழே கைமுறையாக நிரப்பவும்.';
      }
    });
  }

  calculateAge() {
    if (this.localForm.dob) {
      const birthDate = new Date(this.localForm.dob);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age > 0) {
          this.localForm.age = age.toString();
          return;
        }
      }
    }
    this.localForm.age = '';
  }

  onPhotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.localForm.studentPhoto = file.name;
    }
  }

  onCertificateChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.localForm.prevCertificate = file.name;
    }
  }

  currentStep: number = 1;

  setStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
      this.errorMessage = '';
      return;
    }
    if (step > 1 && !this.validateStep1()) return;
    if (step > 2 && !this.validateStep2()) return;
    if (step > 3 && !this.validateStep3()) return;
    this.currentStep = step;
    this.errorMessage = '';
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (this.validateStep1()) {
        this.currentStep = 2;
        this.errorMessage = '';
      }
    } else if (this.currentStep === 2) {
      if (this.validateStep2()) {
        this.currentStep = 3;
        this.errorMessage = '';
      }
    } else if (this.currentStep === 3) {
      if (this.validateStep3()) {
        this.currentStep = 4;
        this.errorMessage = '';
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  validateStep1(): boolean {
    if (!this.localForm.fullName || !this.localForm.fullName.trim()) {
      this.errorMessage = 'errors.enterStudentName';
      return false;
    }
    if (!this.validateDobSegments(true)) {
      this.errorMessage = this.dobError || 'errors.selectDob';
      return false;
    }
    this.dobError = '';
    return true;
  }

  validateStep2(): boolean {
    if (!this.localForm.postalAddress || !this.localForm.postalAddress.trim()) {
      this.errorMessage = 'errors.enterPostalAddress';
      return false;
    }
    if (!this.localForm.pincode) {
      this.errorMessage = 'errors.enterPincode';
      return false;
    }
    const cleanPhone = (this.localForm.mobileNumber || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      this.errorMessage = 'errors.enterValidMobile';
      return false;
    }
    if (!this.localForm.emailAddress || !this.localForm.emailAddress.trim() || !this.localForm.emailAddress.includes('@')) {
      this.errorMessage = 'errors.enterValidEmail';
      return false;
    }
    return true;
  }

  validateStep3(): boolean {
    if (this.localForm.courseLevel === 'mudhunilai') {
      if (!this.localForm.prevCertificate && !this.localForm.prevUserId) {
        this.errorMessage = 'errors.mudhunilaiCertRequired';
        return false;
      }
    }
    return true;
  }

  onSubmit() {
    if (!this.validateStep1()) {
      this.currentStep = 1;
      return;
    }
    if (!this.validateStep2()) {
      this.currentStep = 2;
      return;
    }
    if (!this.validateStep3()) {
      this.currentStep = 3;
      return;
    }
    if (!this.localForm.agreedDeclaration) {
      this.errorMessage = 'errors.acceptRules';
      return;
    }
    this.errorMessage = '';
    this.next.emit(this.localForm);
  }
}

