import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  mobileNumber: string = '';
  password: string = '';
  serviceType: 'astrology' | 'education' = 'astrology';

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

  async onLogin() {
    if (!this.mobileNumber || !this.password) {
      await this.showToast('தயவுசெய்து அலைபேசி எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்', 'warning');
      return;
    }

    this.authService.login(this.mobileNumber, this.password, this.serviceType).subscribe({
      next: (res) => {
        if (this.serviceType === 'education') {
          this.router.navigate(['/learn'], { replaceUrl: true });
        } else {
          this.router.navigate(['/home'], { replaceUrl: true });
        }
      },
      error: async (err) => {
        let msg = 'தவறான அலைபேசி எண் அல்லது கடவுச்சொல்';
        if (err.status === 0) {
          msg = 'சர்வர் தொடர்புகொள்ள முடியவில்லை (Network Error). உங்கள் இணைய இணைப்பை சரிபார்க்கவும்.';
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

  goToRegister() {
    this.router.navigate(['/register'], { queryParams: { service: this.serviceType } });
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password'], { queryParams: { service: this.serviceType } });
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
