import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { PanchangamWidgetComponent } from '../components/panchangam-widget/panchangam-widget';
import { RasiPalanComponent } from '../components/rasi-palan/rasi-palan';
import { MarriageMatchingComponent } from '../components/marriage-matching/marriage-matching';
import { UserProfileComponent } from '../components/user-profile/user-profile';

import { TranslatePipe } from '../pipes/translate.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    TranslatePipe
  ],
  declarations: [
    HomePage,
    PanchangamWidgetComponent,
    RasiPalanComponent,
    MarriageMatchingComponent,
    UserProfileComponent
  ]
})
export class HomePageModule {}
