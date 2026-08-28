import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="header">
          <div class="logo">
            <h1>Admin Portal</h1>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <!-- Error / Warning Alert -->
          @if (errorMessage) {
            <div [class]="isStudentError ? 'alert warning' : 'alert error'">
              <span class="alert-icon">{{ isStudentError ? '📱' : '⚠️' }}</span>
              <div class="alert-content">
                <strong>{{ isStudentError ? 'Student Account Notice' : 'Authentication Error' }}</strong>
                <p>{{ errorMessage }}</p>
              </div>
            </div>
          }

          <div class="form-group">
            <label for="email">Admin Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="email" 
              required 
              placeholder="admin@gmail.com"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="password" 
              required 
              placeholder="••••••••"
              class="form-control"
            />
          </div>

          <button type="submit" [disabled]="loading" class="btn-submit">
            @if (!loading) {
              <span>Sign In to Admin Dashboard ➔</span>
            } @else {
              <span>Authenticating...</span>
            }
          </button>
        </form>

        <div class="footer-note">
          Protected System • Astrology Administration & Course Management Engine
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #1a103c, #0a0618);
      font-family: 'Outfit', 'Inter', sans-serif;
      padding: 20px;
      color: #fff;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background: rgba(23, 15, 48, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 20px;
      padding: 36px 32px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 24px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .logo .icon { font-size: 28px; }

    .logo h1 {
      font-size: 26px;
      font-weight: 700;
      background: linear-gradient(135deg, #fff 0%, #ffd700 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .subtitle { color: #a0a0c0; font-size: 14px; margin: 4px 0 12px 0; }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid rgba(212, 175, 55, 0.4);
      color: #ffd700;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quick-credentials {
      margin-bottom: 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 12px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
    }

    .chip-title {
      display: block;
      font-size: 11px;
      color: #8a8ab0;
      margin-bottom: 8px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .chips { display: flex; flex-wrap: wrap; gap: 8px; }

    .chip {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e0e0ff;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .chip:hover {
      background: rgba(212, 175, 55, 0.3);
      border-color: #ffd700;
      color: #fff;
    }

    .chip.admin { border-color: rgba(99, 102, 241, 0.5); }
    .chip.student { border-color: rgba(239, 68, 68, 0.5); }

    .alert {
      display: flex;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 13px;
    }

    .alert.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }

    .alert.warning {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fde047;
    }

    .alert-icon { font-size: 18px; }

    .alert-content p {
      margin: 2px 0 0 0;
      font-size: 12px;
      opacity: 0.9;
    }

    .form-group { margin-bottom: 18px; }

    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #b0b0d0;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-control {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      background: rgba(10, 6, 24, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      border-color: #ffd700;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
      border: none;
      border-radius: 10px;
      color: #0d0722;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      margin-top: 10px;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .footer-note {
      text-align: center;
      margin-top: 24px;
      font-size: 11px;
      color: #606080;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  isStudentError = false;

  constructor(private authService: AuthService, private router: Router) { }

  fillDemo(email: string, pass: string) {
    this.email = email;
    this.password = pass;
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email address and password.';
      this.isStudentError = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.isStudentError = false;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.user && (res.user.role === 'admin' || res.user.role === 'astrologer' || res.user.role === 'super_admin')) {
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403 && err.error?.is_student) {
          this.isStudentError = true;
          this.errorMessage = err.error.message || 'Student accounts are restricted to the Mobile App.';
        } else {
          this.isStudentError = false;
          this.errorMessage = err.error?.message || 'Invalid email or password. Please check credentials.';
        }
      }
    });
  }
}
