import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JathagamWritingPageRoutingModule } from './jathagam-writing-routing.module';

import { JathagamWritingPage } from './jathagam-writing.page';

import { TranslatePipe } from '../../pipes/translate.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JathagamWritingPageRoutingModule,
    TranslatePipe
  ],
  declarations: [JathagamWritingPage]
})
export class JathagamWritingPageModule {}
