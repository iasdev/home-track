import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminTasksPage } from './admin-tasks.page';

const routes: Routes = [
  {
    path: '',
    component: AdminTasksPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminTasksPageRoutingModule {}
