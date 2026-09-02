import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app';
import { AppRoutingModule } from './app-routing.module';

// Auth / Common Pages
import { SplashPage } from './pages/splash/splash.page';
import { WelcomePage } from './pages/welcome/welcome.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';

// Learn Module
import { LearnPage } from './pages/learn/learn.page';
import { LearnIntroComponent } from './pages/learn/components/intro/intro';
import { LearnRulesComponent } from './pages/learn/components/rules/rules';
import { LearnEnrollComponent } from './pages/learn/components/enroll/enroll';
import { LearnPaymentComponent } from './pages/learn/components/payment/payment';
import { LearnDashboardComponent } from './pages/learn/components/dashboard/dashboard';
import { LearnQuizComponent } from './pages/learn/components/quiz/quiz';
import { LearnCertificateComponent } from './pages/learn/components/certificate/certificate';

// Jathagam Module (all standalone)
import { JathagamPage } from './pages/jathagam/jathagam.page';
import { RasiPalanComponent } from './pages/jathagam/components/rasi-palan/rasi-palan';
import { MatchingComponent } from './pages/jathagam/components/matching/matching';
import { MyJathagamComponent } from './pages/jathagam/components/my-jathagam/my-jathagam';
import { ParaJathagamComponent } from './pages/jathagam/components/para-jathagam/para-jathagam';
import { VastuKanithaComponent } from './pages/jathagam/components/vastu-kanitha/vastu-kanitha';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerLoaderComponent } from './components/spinner-loader/spinner-loader';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

// Profile Module (standalone)
import { ProfilePage } from './pages/profile/profile.page';
import { TranslatePipe } from './pipes/translate.pipe';

import { SegmentedDobComponent } from './components/segmented-dob/segmented-dob.component';

@NgModule({
  declarations: [
    AppComponent,
    SpinnerLoaderComponent,
    SplashPage,
    WelcomePage,
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    LearnPage,
    LearnIntroComponent,
    LearnRulesComponent,
    LearnEnrollComponent,
    LearnPaymentComponent,
    LearnDashboardComponent,
    LearnQuizComponent,
    LearnCertificateComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot(),
    IonicModule,
    AppRoutingModule,
    TranslatePipe,
    // Standalone components imported here
    JathagamPage,
    RasiPalanComponent,
    MatchingComponent,
    MyJathagamComponent,
    ParaJathagamComponent,
    VastuKanithaComponent,
    ProfilePage,
    SegmentedDobComponent,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
