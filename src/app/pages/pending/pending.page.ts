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
    this.pendingFaskTaskNotifications = this.prepareFastTaskNotificationsSorted()
    this.pendingNormalNotifications = this.prepareNormalNotificationsSorted()
  }

  private prepareFastTaskNotificationsSorted(): PendingLocalNotificationSchema[] {
    const fastTaskNotifications = this.allPendingNotif.filter(n => n.extra.fastTask)
    const notifications = this.prepareNotificationsAndSetDataRange(fastTaskNotifications)
    return notifications.sort((n1, n2) => n1.extra.dateRange.localeCompare(n2.extra.dateRange))
  }

  private prepareNormalNotificationsSorted(): PendingLocalNotificationSchema[] {
    let currentYear = new Date().getFullYear()
    const normalNotifications = this.allPendingNotif.filter(n => !n.extra.fastTask && new Date(n.schedule.at).getFullYear() == currentYear)
    const notifications = this.prepareNotificationsAndSetDataRange(normalNotifications)
    return notifications.sort((n1, n2) => n1.extra.nextDate.localeCompare(n2.extra.nextDate))
  }

  private prepareNotificationsAndSetDataRange(notifications: PendingLocalNotificationSchema[]) {
    let result: PendingLocalNotificationSchema[] = []

    notifications.forEach(n => {
      let found = result.find(r => r.title == n.title)

      if (!found) {
        let commonNotificationsDates = notifications.filter(ftn => ftn.title == n.title)
          .map(ftn => new Date(ftn.schedule.at).getTime())
        let minNotificationDate = new Date(Math.min(...commonNotificationsDates)).toLocaleDateString("es-ES")

        if (n.extra.fastTask) {
          let maxNotificationDate = new Date(Math.max(...commonNotificationsDates)).toLocaleDateString("es-ES")
          n.extra.dateRange = minNotificationDate == maxNotificationDate ? maxNotificationDate : `${minNotificationDate} - ${maxNotificationDate}`
        } else {
          n.extra.nextDate = minNotificationDate
        }

        result.push(n)
      }
    })

    return result
  }

  onDateChange(event) {
    if (event && event.detail && event.detail.value) {
      let selectedDate = new Date(event.detail.value).toLocaleDateString("es-ES")
      
      let pendingMsg = this.allPendingNotif
        .filter(p => new Date(p.schedule.at).toLocaleDateString("es-ES") == selectedDate).map(p => p.title)

      if (pendingMsg && pendingMsg.length > 0) {
        let msg = `Next tasks: ${pendingMsg.join(", ")}`
        this.helper.showInfoToast(msg, 'hammer', 2000 * pendingMsg.length)
      } else {
        this.helper.dismissToasts()
      }
    }
  }
}
