import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { AdminComponent } from './components/admin/admin.component';
import { PanchangamPageComponent } from './components/panchangam-page/panchangam-page.component';
import { ZodiacPageComponent } from './components/zodiac-page/zodiac-page.component';
import { ServicesPageComponent } from './components/services-page/services-page.component';
import { AstrologersPageComponent } from './components/astrologers-page/astrologers-page.component';
import { FaqPageComponent } from './components/faq-page/faq-page.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'panchangam', component: PanchangamPageComponent },
  { path: 'zodiac', component: ZodiacPageComponent },
  { path: 'services', component: ServicesPageComponent },
  { path: 'astrologers', component: AstrologersPageComponent },
  { path: 'faq', component: FaqPageComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
