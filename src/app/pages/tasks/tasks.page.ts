import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalNotificationSchema, PendingLocalNotificationSchema } from '@capacitor/local-notifications';
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
    private router: Router,
    private notif: LocalNotificationsWrapperService,
    private helper: IonicHelperService
  ) { }

  async ngOnInit() {
    this.allPendingNotifications = await this.notif.getPending()
    this.refreshTasks();
    this.configureOnTaskDone();
  }

  private refreshTasks() {
    this.tasks = this.storage.getTasks();
  }
  
  private configureOnTaskDone() {
    this.notif.onNotificationDone.subscribe((notification: LocalNotificationSchema) => {
      this.notif.deleteNotificationsByTitle(notification.title)

      let task = this.storage.getTaskByName(notification.title)
      if (task.fastTask) {
        this.storage.deleteTask(task.id)
      } else {
        this.notif.repeatTaskNotif(task)
      }
    })
  }

  showTaskSummary(task) {
    const taskName = `The task '${task.name}'`
    const repeatTimes = `will repeat ${task.repeatTimes} times`
    const startDate = "with start date: " + new Date(task.startDate).toLocaleDateString("es-ES")
    
    let everyWeeks: string
    if (task.everyWeeks && task.everyWeeks > 0) {
      everyWeeks = `will repeat ${task.repeatTimes} times every ${task.everyWeeks} weeks`
    }

    let everyMonths: string
    if (task.everyMonths && task.everyMonths > 0) {
      everyMonths = `will repeat ${task.repeatTimes} times every ${task.everyMonths} months`
    }

    let everyWeeksAndMonths: string
    if (task.everyWeeks && task.everyWeeks > 0 && task.everyMonths && task.everyMonths > 0) {
      everyWeeksAndMonths = `will repeat ${task.repeatTimes} times every ${task.everyWeeks} weeks and ${task.everyMonths} months`
    }

    let taskIcon: string
    let msg: string
    if (task.fastTask) {
      taskIcon = "alert-circle"
      msg = `${taskName} ${startDate} ${repeatTimes}`
    } else {
      taskIcon = "hammer"
      msg = `${taskName} ${startDate}`
      
      if (everyWeeks && everyMonths) {
        msg += ` ${everyWeeksAndMonths}`
      } else if (everyWeeks) {
        msg += ` ${everyWeeks}`
      } else if (everyMonths) {
        msg += ` ${everyMonths}`
      }
    }

    this.helper.showInfoToast(msg, taskIcon, 5000)
  }

  isExpired(task) {
    return !this.allPendingNotifications.find(p => p.title == task.name)
  }

  showScheduleDialog(task) {
    this.helper.showDialog("The task is expired", "Try again?").then((event) => {
      if (event.value) {
        task.startDate = new Date()

        this.notif.repeatTaskNotif(task).then(() => {
          this.helper.showInfoToast("Notifications ready again!", "add-circle-outline")
          this.router.navigate(['pending'])
        }).catch(() => {
          this.helper.showInfoToast("Error creating notifications...")
        })
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
