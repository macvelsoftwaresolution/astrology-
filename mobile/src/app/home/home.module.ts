import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { PanchangamWidgetComponent } from '../components/panchangam-widget/panchangam-widget.component';
import { RasiPalanComponent } from '../components/rasi-palan/rasi-palan.component';
import { MarriageMatchingComponent } from '../components/marriage-matching/marriage-matching.component';
import { UserProfileComponent } from '../components/user-profile/user-profile.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
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
