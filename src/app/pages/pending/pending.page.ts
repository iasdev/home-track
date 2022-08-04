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

  protected now = new Date().toISOString()
  protected pendingFaskTaskNotifications: PendingLocalNotificationSchema[] = []
  protected pendingNormalNotifications: PendingLocalNotificationSchema[] = []
  private allPendingNotif: PendingLocalNotificationSchema[] = []

  constructor(
    private notif: LocalNotificationsWrapperService,
    private helper: IonicHelperService
  ) { }

  ngOnInit() {
    this.preparePendingNotifications()
  }

  private async preparePendingNotifications() {
    this.allPendingNotif = await this.notif.getPending()
    this.pendingFaskTaskNotifications = this.prepareFastTaskNotifications()
    this.pendingNormalNotifications = this.prepareNormalNotifications()
  }

  private prepareFastTaskNotifications(): PendingLocalNotificationSchema[] {
    const fastTaskNotifications = this.allPendingNotif.filter(n => n.extra.fastTask)
    return this.filterFirstNotifications(fastTaskNotifications)
  }

  private prepareNormalNotifications(): PendingLocalNotificationSchema[] {
    let currentYear = new Date().getFullYear()
    const normalNotifications = this.allPendingNotif.filter(n => !n.extra.fastTask && new Date(n.schedule.at).getFullYear() == currentYear)
    return this.filterFirstNotifications(normalNotifications)
  }

  private filterFirstNotifications(notifications: PendingLocalNotificationSchema[]) {
    let result: PendingLocalNotificationSchema[] = []

    notifications.forEach(n => {
      let found = result.find(r => r.title == n.title)

      if (!found) {
        result.push(n)
      }
    })

    return result.sort((n1, n2) => n1.extra.firstDate - n2.extra.firstDate)
  }

  onDateChange(event) {
    if (event && event.detail && event.detail.value) {
      let selectedDate = new Date(event.detail.value).toLocaleDateString("es-ES")
      
      let pendingMsg = this.allPendingNotif
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
