import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing';
import { LoginComponent } from './components/login/login';
import { AdminDashboardComponent } from './components/admin/admin-dashboard';
import { PanchangamPageComponent } from './components/panchangam-page/panchangam-page';
import { ZodiacPageComponent } from './components/zodiac-page/zodiac-page';
import { ServicesPageComponent } from './components/services-page/services-page';
import { AstrologersPageComponent } from './components/astrologers-page/astrologers-page';
import { FaqPageComponent } from './components/faq-page/faq-page';
import { adminGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', redirectTo: 'admin/overview', pathMatch: 'full' },
  { path: 'admin/:section', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'panchangam', component: PanchangamPageComponent },
  { path: 'zodiac', component: ZodiacPageComponent },
  { path: 'services', component: ServicesPageComponent },
  { path: 'astrologers', component: AstrologersPageComponent },
  { path: 'faq', component: FaqPageComponent },
  { path: '**', redirectTo: 'login' }
];
