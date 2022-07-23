import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PendingPage } from './pending.page';

const routes: Routes = [
  {
    path: '',
    component: PendingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingPageRoutingModule {}
