import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-marriage-matching',
  templateUrl: './marriage-matching.component.html',
  styleUrls: ['./marriage-matching.component.scss'],
  standalone: false
})
export class MarriageMatchingComponent implements OnInit {
  @Input() rasis: any[] = [];

  // Main flow state
  // 0: Options screen
  // 1: Registration Form
  // 2: Registration Payment
  // 3: Registration Success
  // 4: Matching Form
  // 5: Matching Success
  serviceStep: number = 0; 

  // Form model for Option 1: Matrimony Registration
  regForm = {
    // Basic Details
    regNo: '', date: '', name: '', gender: 'ஆண்',
    religion: '', caste: '', subcaste: '',
    
    // Birth Details
    dob: '', tob: '', pob: '', age: '',
    
    // Physical & Edu
    height: '', complexion: '', bloodGroup: '', education: '',
    
    // Professional
    job: '', workPlace: '', monthlyIncome: '',
    
    // Family
    fatherName: '', motherName: '', fatherJob: '', motherJob: '',
    nativePlace: '', currentPlace: '', familyDeity: '', gotra: '',
    
    // Siblings
    brothers: '', sisters: '', siblingsMaritalStatus: '',
    
    // Expectations & Assets
    dowryExpectation: '', propertyDetails: '', partnerExpectation: '',
    
    // Astrological
    lagnam: '', rasi: '', star: '', dasaBalance: '',
    
    // Contact
    address: '', contactPersonRelation: '', contactPersonName: '',
    phone1: '', phone2: '', photoAttached: false
  };

  // Form model for Option 2: Marriage Matching (Thirumana Porutham)
  matchingForm = {
    boyName: '', boyDob: '', boyTob: '', boyPob: '', boyRasi: 'சிம்மம்', boyStar: 'பூரம்', boyAge: '',
    girlName: '', girlDob: '', girlTob: '', girlPob: '', girlRasi: 'தனுசு', girlStar: 'மூலம்', girlAge: ''
  };

  // User Orders tracking for payment simulation (dummy)
  userOrders: any[] = [];

  ngOnInit() {
    // Set current date in registration form
    const today = new Date();
    this.regForm.date = today.toISOString().split('T')[0];
  }

  // Navigation Methods
  goBack() {
    if (this.serviceStep === 1 || this.serviceStep === 4) {
      this.serviceStep = 0; // Back to options
    } else if (this.serviceStep === 2) {
      this.serviceStep = 1; // Back to reg form from payment
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

  // Registration Flow
  goToRegPayment() {
    if (!this.regForm.name || !this.regForm.dob || !this.regForm.phone1) {
      alert('முக்கிய விவரங்களை (பெயர், பிறந்த தேதி, அலைபேசி எண்) உள்ளிடவும்.');
      return;
    }
    this.serviceStep = 2; // Payment
  }

  payForRegistration() {
    // Simulating Payment
    setTimeout(() => {
      this.serviceStep = 3; // Success
    }, 1000);
  }

  // Matching Flow
  sendMatchingToAdmin() {
    if (!this.matchingForm.boyName || !this.matchingForm.girlName) {
      alert('இருபாலரின் பெயரையும் உள்ளிடவும்!');
      return;
    }
    
    // Simulating API call to admin
    setTimeout(() => {
      this.serviceStep = 5; // Success Admin Notified
    }, 800);
  }

  resetApp() {
    this.serviceStep = 0;
    // Reset matching form
    this.matchingForm.boyName = '';
    this.matchingForm.girlName = '';
  }
}
