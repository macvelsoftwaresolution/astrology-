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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastController: ToastController,
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

  async onRegister() {
    if (!this.fullName || !this.mobileNumber || !this.emailAddress || !this.password) {
      await this.showToast('தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும்', 'warning');
      return;
    }

    if (this.password.length < 6) {
      await this.showToast('கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showToast('கடவுச்சொற்கள் பொருந்தவில்லை (Passwords do not match)', 'warning');
      return;
    }

    const user: User = {
      fullName: this.fullName,
      mobileNumber: this.mobileNumber,
      emailAddress: this.emailAddress,
      password: this.password,
      profileImage: this.profilePicBase64 || undefined
    };

    this.authService.register(user, this.serviceType).subscribe({
      next: async (res) => {
        await this.showToast('பதிவு வெற்றிகரமாக முடிந்தது!', 'success');
        if (this.serviceType === 'education') {
          this.navCtrl.navigateRoot('/learn');
        } else {
          this.navCtrl.navigateRoot('/home');
        }
      },
      error: async (err) => {
        console.error('Registration error details:', err.error);
        let msg = 'இந்த அலைபேசி எண் / மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.';
        if (err.status === 0) {
          msg = 'சர்வர் தொடர்புகொள்ள முடியவில்லை (Network Error). உங்கள் இணைய இணைப்பை சரிபார்க்கவும்.';
        } else if (err.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          const errorDetail = err.error.errors[firstKey][0];
          if (firstKey === 'email' && errorDetail.includes('taken')) {
            msg = 'இந்த மின்னஞ்சல் முகவரி ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. தயவுசெய்து உள்நுழையவும்.';
          } else {
            msg = errorDetail;
          }
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        await this.showToast(msg, 'danger');
      }
    });
  }

  goBack() {
    this.router.navigate(['/welcome']);
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { service: this.serviceType } });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
