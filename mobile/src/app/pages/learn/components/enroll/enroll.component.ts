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
  }

  setCourseLevel(level: 'ilanilai' | 'mudhunilai') {
    this.localForm.courseLevel = level;
    this.fetchSuccessMsg = '';
    this.fetchErrorMsg = '';
  }

  fetchIlanilaiDetails() {
    const query = (this.ilanilaiSearchQuery || this.localForm.prevUserId || '').trim();
    if (!query) {
      this.fetchErrorMsg = 'தயவுசெய்து உங்கள் இளநிலை பயனர் ஐடி / பதிவு எண் அல்லது அலைபேசி எண்ணை உள்ளிடவும்.';
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

  onSubmit() {
    if (!this.localForm.studentNameTamil || !this.localForm.studentNameTamil.trim()) {
      this.errorMessage = 'தயவுசெய்து மாணவர் பெயரைத் தமிழில் உள்ளிடவும் (1. மாணவர் பெயர் தமிழில் *).';
      return;
    }
    // Check if contains Tamil characters
    const tamilRegex = /[\u0B80-\u0BFF]/;
    if (!tamilRegex.test(this.localForm.studentNameTamil)) {
      this.errorMessage = 'மாணவர் பெயர் கட்டாயமாக தமிழ் எழுத்துக்களில் மட்டுமே இருக்க வேண்டும் (எ.கா: கார்த்திக்).';
      return;
    }
    if (!this.localForm.fullName || !this.localForm.fullName.trim()) {
      this.errorMessage = 'தயவுசெய்து மாணவர் பெயரை ஆங்கிலத்தில் உள்ளிடவும் (2. Name in English *).';
      return;
    }
    if (!this.localForm.mobileNumber || !this.localForm.mobileNumber.trim()) {
      this.errorMessage = 'தயவுசெய்து முதன்மை அலைபேசி எண்ணை உள்ளிடவும்.';
      return;
    }
    if (!this.localForm.emailAddress || !this.localForm.emailAddress.trim()) {
      this.errorMessage = 'தயவுசெய்து மின்னஞ்சல் முகவரியை உள்ளிடவும்.';
      return;
    }
    if (!this.localForm.dob) {
      this.errorMessage = 'தயவுசெய்து பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்.';
      return;
    }
    if (!this.localForm.agreedDeclaration) {
      this.errorMessage = 'தயவுசெய்து விதிமுறைகள் உறுதிமொழியை ஏற்கவும்.';
      return;
    }
    this.errorMessage = '';
    this.next.emit(this.localForm);
  }
}

