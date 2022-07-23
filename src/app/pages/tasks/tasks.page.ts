import { Component, OnInit } from '@angular/core';
import { PendingLocalNotificationSchema } from '@capacitor/local-notifications';
import { IonicHelperService } from 'src/app/services/ionic-helper.service';
import { LocalNotificationsWrapperService } from 'src/app/services/local-notifications-wrapper.service';
import { StorageWrapperService } from 'src/app/services/storage-wrapper.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
})
export class TasksPage implements OnInit {
  
  private allPendingNotifications: PendingLocalNotificationSchema[] = []
  protected tasks: any[]

  constructor(
    private storage: StorageWrapperService,
    private notif: LocalNotificationsWrapperService,
    private helper: IonicHelperService
  ) { }

  async ngOnInit() {
    this.allPendingNotifications = await this.notif.getPending()
    this.refreshTasks();
  }

  private refreshTasks() {
    this.tasks = this.storage.getTasks();
  }

  getTaskSummary(task) {
    return task.name + " - Repeat times: " + task.repeatTimes
  }

  isExpired(task) {
    return !this.allPendingNotifications.find(p => p.title == task.name)
  }

  showScheduleDialog(task) {
    this.helper.showDialog("The task is expired", "Try again?").then((event) => {
      if (event.value) {
        task.startDate = new Date()

        let scheduled = this.notif.createFastTaskNotif(task)
        if (scheduled) {
          this.helper.showInfoToast("Notifications ready again!", "add-circle-outline")
        } else {
          this.helper.showInfoToast("Error creating notifications...")
        }
      }
    })
  }

  showDeleteCompleteDialog(task) {
    this.helper.showDialog("Are you sure?", task.fastTask ? "Did you complete the task?" : "Do you want to delete the task?").then((event) => {
      if (event.value) {
        this.deleteTask(task)
      }
    })
  }

  private deleteTask(task) {
    this.notif.deleteNotificationsByTitle(task.name)
    let deleted = this.storage.deleteTask(task.id)
    if (deleted) {
      let title = "Task deleted"
      let icon = "trash"
      
      if (task.fastTask) {
        title = "Task completed"
        icon = "checkmark-circle"
      }

      this.refreshTasks();
      this.helper.showInfoToast(title, icon)
    } else {
      this.helper.showErrorToast("Error deleting task")
    }
  }
}
