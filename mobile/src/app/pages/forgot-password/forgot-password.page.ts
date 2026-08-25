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
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  onResetPassword() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.mobileNumber) {
      this.errorMessage = 'தயவுசெய்து உங்கள் அலைபேசி எண்ணை உள்ளிடவும்';
      return;
    }

    this.authService.forgotPassword(this.mobileNumber).subscribe({
      next: (res) => {
        if (res.success) {
          this.recoveredPassword = `சரிபார்க்கப்பட்டது: ${res.user?.email || res.message}`;
          this.successMessage = res.message || 'கடவுச்சொல் மீட்பு விவரங்கள் பெறப்பட்டன.';
        } else {
          this.recoveredPassword = null;
          this.errorMessage = 'இந்த அலைபேசி எண்ணில் எந்தவொரு கணக்கும் இல்லை';
        }
      },
      error: () => {
        this.recoveredPassword = null;
        this.errorMessage = 'இந்த அலைபேசி எண்ணில் எந்தவொரு கணக்கும் இல்லை';
      }
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
