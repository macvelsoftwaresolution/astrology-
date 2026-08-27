import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-learn-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss'],
  standalone: false
})
export class LearnEnrollComponent implements OnInit {
  @Input() form: any;
  @Output() next = new EventEmitter<any>();

  private authService = inject(AuthService);

  ilanilaiSearchQuery: string = '';
  isFetchingIlanilai: boolean = false;
  fetchSuccessMsg: string = '';
  fetchErrorMsg: string = '';
  availableBatches: any[] = [];
  activeBatchName: string = '';

  localForm = {
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
    trainingMode: '1_day', // 1_day (9 hours) or 5_day (2 hours)
    batchTiming: 'A', // A: திங்கள், B: புதன், C: வெள்ளி, D: மாலை
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
    this.loadBatches();
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
      this.fetchErrorMsg = 'தயவுசெய்து உங்கள் இளநிலை மாணவர் ஐடியை (Student ID e.g. 26AR01) உள்ளிடவும்.';
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
          this.fetchSuccessMsg = '✅ இளநிலை மாணவர் விவரங்கள் வெற்றிகரமாக மீட்டெடுக்கப்பட்டு படிவத்தில் நிரப்பப்பட்டன!';
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
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age > 0) {
        this.localForm.age = age.toString();
      }
    }
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
    if (!this.localForm.dob) {
      this.errorMessage = 'errors.selectDob';
      return false;
    }
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

