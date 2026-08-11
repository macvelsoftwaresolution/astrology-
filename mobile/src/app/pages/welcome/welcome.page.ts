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
  }

  selectAstrologyServices() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  selectSpiritualEducation() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/learn']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
