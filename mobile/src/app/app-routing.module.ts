import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// Auth / Common Pages
import { SplashPage } from './pages/splash/splash.page';
import { WelcomePage } from './pages/welcome/welcome.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';

// Feature Pages
import { LearnPage } from './pages/learn/learn.page';
import { JathagamPage } from './pages/jathagam/jathagam.page';
import { ProfilePage } from './pages/profile/profile.page';

// Jathagam Sub-Components
import { RasiPalanComponent } from './pages/jathagam/components/rasi-palan/rasi-palan.component';
import { MatchingComponent } from './pages/jathagam/components/matching/matching.component';
import { MyJathagamComponent } from './pages/jathagam/components/my-jathagam/my-jathagam.component';
import { ParaJathagamComponent } from './pages/jathagam/components/para-jathagam/para-jathagam.component';
import { VastuKanithaComponent } from './pages/jathagam/components/vastu-kanitha/vastu-kanitha.component';

const routes: Routes = [
  { path: 'splash', component: SplashPage },
  { path: 'welcome', component: WelcomePage },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'forgot-password', component: ForgotPasswordPage },
  { path: 'learn', component: LearnPage },
  { path: 'profile', component: ProfilePage },

  // Jathagam Hub with child routes
  {
    path: 'jathagam',
    component: JathagamPage,
    children: [
      { path: '', redirectTo: 'rasi-palan', pathMatch: 'full' },
      { path: 'rasi-palan', component: RasiPalanComponent },
      { path: 'matching', component: MatchingComponent },
      { path: 'my-jathagam', component: MyJathagamComponent },
      { path: 'para-jathagam', component: ParaJathagamComponent },
      { path: 'vastu-kanitha', component: VastuKanithaComponent },
    ]
  },

  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule)
  },

  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
