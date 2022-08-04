import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsPage } from './settings.page';


const routes: Routes = [
  {
    path: '',
    component: SettingsPage
  },
  {
    path: 'admin-notifications',
    loadChildren: () => import('./admin-notifications/admin-notifications.module').then( m => m.AdminNotificationsPageModule)
  },
  {
    path: 'admin-tasks',
    loadChildren: () => import('./admin-tasks/admin-tasks.module').then( m => m.AdminTasksPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
