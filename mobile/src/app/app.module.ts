import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// New Pages & Components
import { SplashPage } from './pages/splash/splash.page';
import { WelcomePage } from './pages/welcome/welcome.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
import { LearnPage } from './pages/learn/learn.page';
import { LearnIntroComponent } from './pages/learn/components/intro/intro.component';
import { LearnRulesComponent } from './pages/learn/components/rules/rules.component';
import { LearnEnrollComponent } from './pages/learn/components/enroll/enroll.component';
import { LearnPaymentComponent } from './pages/learn/components/payment/payment.component';
import { LearnDashboardComponent } from './pages/learn/components/dashboard/dashboard.component';
import { LearnQuizComponent } from './pages/learn/components/quiz/quiz.component';
import { LearnCertificateComponent } from './pages/learn/components/certificate/certificate.component';

@NgModule({
  declarations: [
    AppComponent,
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
    LearnCertificateComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
