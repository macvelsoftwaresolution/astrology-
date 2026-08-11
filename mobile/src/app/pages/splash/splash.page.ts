import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false,
})
export class SplashPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Automatically navigate to welcome page after 3 seconds
    setTimeout(() => {
      this.goToWelcome();
    }, 3000);
  }

  goToWelcome() {
    this.router.navigate(['/welcome']);
  }
}
