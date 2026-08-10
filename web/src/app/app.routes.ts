import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];

