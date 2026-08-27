import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService, LanguageCode } from '../../services/translation.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit {
  showLanguageModal: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    public translationService: TranslationService
  ) { }

  ngOnInit() {
    this.checkLanguageChoice();
  }

  ionViewWillEnter() {
    this.checkLanguageChoice();
  }

  checkLanguageChoice() {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('astro_mobile_lang') || sessionStorage.getItem('astro_mobile_lang');
      if (!savedLang) {
        this.showLanguageModal = true;
      }
    }
  }

  selectLanguage(lang: LanguageCode) {
    this.translationService.setLanguage(lang);
    this.showLanguageModal = false;
  }

  selectAstrologyServices() {
    if (this.authService.isLoggedIn('astrology')) {
      this.router.navigate(['/home'], { replaceUrl: true });
    } else {
      this.router.navigate(['/login'], { queryParams: { service: 'astrology' }, replaceUrl: true });
    }
  }

  selectSpiritualEducation() {
    this.router.navigate(['/learn'], { replaceUrl: true });
  }
}
