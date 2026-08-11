import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  mobileNumber: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  async onLogin() {
    if (!this.mobileNumber || !this.password) {
      await this.showToast('தயவுசெய்து அலைபேசி எண் மற்றும் கடவுச்சொல்லை உள்ளிடவும்', 'warning');
      return;
    }

    const success = this.authService.login(this.mobileNumber, this.password);
    if (success) {
      await this.showToast('வெற்றிகரமாக உள்நுழைந்தீர்கள்!', 'success');
      this.router.navigate(['/home']);
    } else {
      await this.showToast('தவறான அலைபேசி எண் அல்லது கடவுச்சொல்', 'danger');
    }
  }

  goBack() {
    this.router.navigate(['/welcome']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
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
