import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminTasksPageRoutingModule } from './admin-tasks-routing.module';

import { AdminTasksPage } from './admin-tasks.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminTasksPageRoutingModule
  ],
  declarations: [AdminTasksPage]
})
export class AdminTasksPageModule {}
