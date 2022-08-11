import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { App } from '@capacitor/app'
import { LocalNotificationSchema } from '@capacitor/local-notifications'
import { IonicHelperService } from './services/ionic-helper.service'
import { LocalNotificationsWrapperService } from './services/local-notifications-wrapper.service'
import { StorageWrapperService } from './services/storage-wrapper.service'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private randomMessages = [
    "What's up?", "Today > Tomorrow", "Hi! :D", "Make it works!", "If works, dont touch it!", 
    "New notifications? :D", "Welcome back!", "Never gonna give you up!"]

  protected topMenuOptions = [
    { title: 'Pending tasks', url: '/pending', icon: 'calendar' },
    { title: 'All tasks', url: '/tasks', icon: 'hammer' },
    { title: 'Fast task', url: '/fast-task', icon: 'alert-circle' },
  ]
  protected downMenuOptions = [
    { title: 'Settings', url: '/settings', icon: 'settings' }
  ]
  protected randomMessage: string

  constructor(
    private storage: StorageWrapperService,
    private router: Router,
    private notif: LocalNotificationsWrapperService,
    private helper: IonicHelperService
  ) {
    this.storage.prepareData()
  }

  ngOnInit() {
    this.randomMessage = this.getRandomMessage()
    this.configureOnTaskDone()
  }

  getRandomMessage() : string {
    let random = Math.random()*this.randomMessages.length
    let index = parseInt(random.toString())
    return this.randomMessages[index]
  }

  private configureOnTaskDone() {
    this.notif.onNotificationDone.subscribe((notification: LocalNotificationSchema) => {
      if (!notification) {
        return
      }
      
      this.notif.deleteNotificationsByTitle(notification.title).then(() => {
        let task = this.storage.getTaskByName(notification.title)

        if (task.fastTask) {
          this.storage.deleteTask(task.id)
          this.helper.showInfoToast("Task completed!", "checkmark-circle")
          this.router.navigate(['tasks'])
        } else {
          this.notif.repeatTaskNotif(task).then(() => {
            this.helper.showInfoToast("Task completed and notifications ready again!", "checkmark-circle")
            this.router.navigate(['pending'])
          }).catch(() => {
            this.helper.showErrorToast("Error while repeating task after completed...")
          })
        }
      }).catch(() => {
        this.helper.showErrorToast("Error while deleting notifications...")
      })
    })
  }

  exitApp() {
    App.exitApp()
  }
}
