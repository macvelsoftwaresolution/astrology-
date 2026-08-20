import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.checkAuthAndNavigate();
    }, 2000);
  }

  goToWelcome() {
    this.checkAuthAndNavigate();
  }

  checkAuthAndNavigate() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.router.navigate(['/welcome'], { replaceUrl: true });
    }
  }
}

