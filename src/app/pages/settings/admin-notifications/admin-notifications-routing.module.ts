import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminNotificationsPage } from './admin-notifications.page';

const routes: Routes = [
  {
    path: '',
    component: AdminNotificationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminNotificationsPageRoutingModule {}
