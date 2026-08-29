import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  fullName: string = '';
  mobileNumber: string = '';
  emailAddress: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  serviceType: 'astrology' | 'education' = 'astrology';
  profilePicBase64: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['service']) {
        this.serviceType = params['service'];
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onRegister() {
    if (!this.fullName || !this.mobileNumber || !this.emailAddress || !this.password) {
      this.errorMessage = 'errors.fillAllFields';
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.emailAddress.trim())) {
      this.errorMessage = 'errors.enterValidEmail';
      return;
    }

    const cleanPhone = this.mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      this.errorMessage = 'errors.enterValidMobile';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'errors.passwordMinLength';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'errors.passwordsDoNotMatch';
      return;
    }

    this.errorMessage = '';

    const user: User = {
      fullName: this.fullName,
      mobileNumber: this.mobileNumber,
      emailAddress: this.emailAddress,
      password: this.password,
      profileImage: this.profilePicBase64 || undefined
    };

    this.authService.register(user, this.serviceType).subscribe({
      next: (res) => {
        if (this.serviceType === 'education') {
          this.navCtrl.navigateRoot('/learn');
        } else {
          this.navCtrl.navigateRoot('/home');
        }
      },
      error: (err) => {
        console.error('Registration error details:', err.error);
        let msg = 'இந்த அலைபேசி எண் / மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.';
        if (err.status === 0) {
          msg = 'சர்வர் தொடர்புகொள்ள முடியவில்லை (Network Error). உங்கள் இணைய இணைப்பை சரிபார்க்கவும்.';
        } else if (err.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          const errorDetail = err.error.errors[firstKey][0];
          if (firstKey === 'email' && errorDetail.includes('taken')) {
            msg = 'errors.emailRegistered';
          } else {
            msg = errorDetail;
          }
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.errorMessage = msg;
      }
    });
  }

  goBack() {
    this.router.navigate(['/welcome']);
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { service: this.serviceType } });
  }
}
