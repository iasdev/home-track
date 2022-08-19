import { Component, OnInit } from '@angular/core'
import { PendingLocalNotificationSchema } from '@capacitor/local-notifications'
import { IonicHelperService } from 'src/app/services/ionic-helper.service'
import { LocalNotificationsWrapperService } from 'src/app/services/local-notifications-wrapper.service'

@Component({
  selector: 'app-pending',
  templateUrl: './pending.page.html',
  styleUrls: ['./pending.page.scss'],
})
export class PendingPage implements OnInit {

  protected pendingNotifications: PendingLocalNotificationSchema[] = []

  constructor(
    private notif: LocalNotificationsWrapperService,
    private helper: IonicHelperService
  ) { }

  ngOnInit() {
    this.preparePendingNotifications()
  }

  private async preparePendingNotifications() {
    let notifications = await this.notif.getPending()
    this.pendingNotifications = this.filterFirstNotificationsAndSort(notifications)
  }

  private filterFirstNotificationsAndSort(notifications: PendingLocalNotificationSchema[]) {
    let result: PendingLocalNotificationSchema[] = []

    notifications.forEach(n => {
      let added = result.find(r => r.title == n.title)

      if (!added) {
        let notifs = notifications.filter(n2 => n2.title == n.title)
        let notif = notifs.sort((n1, n2) => new Date(n1.schedule.at).getTime() - new Date(n2.schedule.at).getTime())[0]
        result.push(notif)
      }
    })

    result.sort((n1, n2) => n1.extra.firstDate - n2.extra.firstDate)

    let fastTasks = result.filter(r => r.extra.fastTask)
    let normalTasks = result.filter(r => !r.extra.fastTask)

    return [...fastTasks, ...normalTasks]
  }

  getCalendarDate(max: true) {
    const allPendingNotifTimes = this.pendingNotifications.map(n => new Date(n.schedule.at).getTime())
    return new Date(max ? Math.max(...allPendingNotifTimes) : Date.now()).toISOString()
  }

  onDateChange(event) {
    if (event && event.detail && event.detail.value) {
      let selectedDate = new Date(event.detail.value).toLocaleDateString("es-ES")
      
      let pendingMsg = this.pendingNotifications
        .filter(p => new Date(p.schedule.at).toLocaleDateString("es-ES") == selectedDate).map(p => p.title)

      if (pendingMsg && pendingMsg.length > 0) {
        let msg = pendingMsg.join(", ")
        this.helper.showInfoToast(msg, 'hammer', 2000 * pendingMsg.length)
      } else {
        this.helper.dismissToasts()
      }
    }
  }
}
