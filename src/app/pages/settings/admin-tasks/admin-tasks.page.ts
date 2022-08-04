import { Component, OnInit } from '@angular/core';
import { StorageWrapperService } from 'src/app/services/storage-wrapper.service';

@Component({
  selector: 'app-admin-tasks',
  templateUrl: './admin-tasks.page.html',
  styleUrls: ['./admin-tasks.page.scss'],
})
export class AdminTasksPage implements OnInit {

  protected tasks: any[]

  constructor(private storage: StorageWrapperService) { }

  ngOnInit() {
    this.tasks = this.storage.getTasks()
  }
}
