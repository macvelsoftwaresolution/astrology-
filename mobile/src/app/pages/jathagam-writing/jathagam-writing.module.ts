import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JathagamWritingPageRoutingModule } from './jathagam-writing-routing.module';

import { JathagamWritingPage } from './jathagam-writing.page';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { SegmentedDobComponent } from '../../components/segmented-dob/segmented-dob.component';
import { SegmentedTobComponent } from '../../components/segmented-tob/segmented-tob.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JathagamWritingPageRoutingModule,
    TranslatePipe,
    SegmentedDobComponent,
    SegmentedTobComponent
  ],
  declarations: [JathagamWritingPage]
})
export class JathagamWritingPageModule {}
