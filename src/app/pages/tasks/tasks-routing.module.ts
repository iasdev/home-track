import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TasksPage } from './tasks.page';

const routes: Routes = [
  {
    path: '',
    component: TasksPage
  },
  {
    path: 'task',
    loadChildren: () => import('./task/task.module').then( m => m.TaskPageModule)
  },
  {
    path: 'task/:id',
    loadChildren: () => import('./task/task.module').then( m => m.TaskPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TasksPageRoutingModule {}
