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
      this.errorMessage = 'errors.enterPhone';
      return;
    }

    this.authService.forgotPassword(this.mobileNumber).subscribe({
      next: (res) => {
        if (res.success) {
          this.recoveredPassword = `${res.user?.email || res.message}`;
          this.successMessage = res.message || 'common.success';
        } else {
          this.recoveredPassword = null;
          this.errorMessage = 'errors.accountNotFound';
        }
      },
      error: () => {
        this.recoveredPassword = null;
        this.errorMessage = 'errors.accountNotFound';
      }
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
