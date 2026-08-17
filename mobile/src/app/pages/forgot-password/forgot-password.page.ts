import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
})
export class ForgotPasswordPage implements OnInit {
  mobileNumber: string = '';
  recoveredPassword: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  onResetPassword() {
    if (!this.mobileNumber) {
      this.showToast('தயவுசெய்து உங்கள் அலைபேசி எண்ணை உள்ளிடவும்', 'warning');
      return;
    }

    this.authService.forgotPassword(this.mobileNumber).subscribe({
      next: (res) => {
        if (res.success) {
          this.recoveredPassword = `சரிபார்க்கப்பட்டது: ${res.user?.email || res.message}`;
          this.showToast(res.message, 'success');
        } else {
          this.recoveredPassword = null;
          this.showToast('இந்த அலைபேசி எண்ணில் எந்தவொரு கணக்கும் இல்லை', 'danger');
        }
      },
      error: () => {
        this.recoveredPassword = null;
        this.showToast('இந்த அலைபேசி எண்ணில் எந்தவொரு கணக்கும் இல்லை', 'danger');
      }
    });
  }

  goBack() {
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
