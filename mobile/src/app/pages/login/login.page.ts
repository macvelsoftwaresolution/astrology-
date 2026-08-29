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
  showPassword: boolean = false;
  serviceType: 'astrology' | 'education' = 'astrology';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private navCtrl: NavController
  ) { }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['service']) {
        this.serviceType = params['service'];
      }
    });
  }

  onLogin() {
    if (!this.mobileNumber || !this.password) {
      this.errorMessage = 'login.fillFieldsError';
      return;
    }

    this.errorMessage = '';

    this.authService.login(this.mobileNumber, this.password, this.serviceType).subscribe({
      next: (res) => {
        if (this.serviceType === 'education') {
          this.router.navigate(['/learn'], { replaceUrl: true });
        } else {
          this.router.navigate(['/home'], { replaceUrl: true });
        }
      },
      error: (err) => {
        let msg = 'login.invalidCreds';
        if (err.status === 0) {
          msg = 'login.netError';
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

  goToRegister() {
    this.router.navigate(['/register'], { queryParams: { service: this.serviceType } });
  }
}
