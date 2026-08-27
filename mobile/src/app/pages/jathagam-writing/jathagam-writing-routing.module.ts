import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JathagamWritingPage } from './jathagam-writing.page';

const routes: Routes = [
  {
    path: '',
    component: JathagamWritingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JathagamWritingPageRoutingModule {}
