import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

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
  serviceType: 'astrology' | 'education' = 'astrology';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['service']) {
        this.serviceType = params['service'];
      }
    });
  }

  async onRegister() {
    if (!this.fullName || !this.mobileNumber || !this.emailAddress) {
      await this.showToast('தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும்', 'warning');
      return;
    }

    const defaultPwd = this.serviceType === 'education' ? '654321' : '123456';
    const user: User = {
      fullName: this.fullName,
      mobileNumber: this.mobileNumber,
      emailAddress: this.emailAddress,
      password: defaultPwd // set default password based on service type
    };

    this.authService.register(user, this.serviceType).subscribe({
      next: async (res) => {
        await this.showToast('பதிவு வெற்றிகரமாக முடிந்தது!', 'success');
        if (this.serviceType === 'education') {
          this.router.navigate(['/learn']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: async (err) => {
        const msg = err.error?.message || 'இந்த அலைபேசி எண் / மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.';
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
