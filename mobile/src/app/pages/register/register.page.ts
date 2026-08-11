import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  async onRegister() {
    if (!this.fullName || !this.mobileNumber || !this.emailAddress) {
      await this.showToast('தயவுசெய்து அனைத்து விவரங்களையும் நிரப்பவும்', 'warning');
      return;
    }

    const user: User = {
      fullName: this.fullName,
      mobileNumber: this.mobileNumber,
      emailAddress: this.emailAddress,
      password: '123456' // set default password
    };

    const success = this.authService.register(user);
    if (success) {
      await this.showToast('பதிவு வெற்றிகரமாக முடிந்தது!', 'success');
      this.router.navigate(['/home']);
    } else {
      await this.showToast('இந்த அலைபேசி எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.', 'danger');
    }
  }

  goBack() {
    this.router.navigate(['/welcome']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
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
