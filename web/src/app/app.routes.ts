import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { PanchangamPageComponent } from './components/panchangam-page/panchangam-page.component';
import { ZodiacPageComponent } from './components/zodiac-page/zodiac-page.component';
import { ServicesPageComponent } from './components/services-page/services-page.component';
import { AstrologersPageComponent } from './components/astrologers-page/astrologers-page.component';
import { FaqPageComponent } from './components/faq-page/faq-page.component';
import { adminGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'panchangam', component: PanchangamPageComponent },
  { path: 'zodiac', component: ZodiacPageComponent },
  { path: 'services', component: ServicesPageComponent },
  { path: 'astrologers', component: AstrologersPageComponent },
  { path: 'faq', component: FaqPageComponent },
  { path: '**', redirectTo: 'login' }
];
