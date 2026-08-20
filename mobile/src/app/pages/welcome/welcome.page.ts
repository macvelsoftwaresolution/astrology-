import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.checkIfLoggedIn();
  }

  ionViewWillEnter() {
    this.checkIfLoggedIn();
  }

  checkIfLoggedIn() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }

  selectAstrologyServices() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.router.navigate(['/login'], { queryParams: { service: 'astrology' } });
    }
  }

  selectSpiritualEducation() {
    this.router.navigate(['/learn'], { replaceUrl: true });
  }
}
