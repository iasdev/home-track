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
  private allPendingNotifications: PendingLocalNotificationSchema[] = []

  constructor(
    private notif: LocalNotificationsWrapperService,
    private helper: IonicHelperService
  ) { }

  ngOnInit() {
    this.preparePendingNotifications()
  }

  private async preparePendingNotifications() {
    this.allPendingNotifications = await this.notif.getPending()
    this.pendingFaskTaskNotifications = this.prepareFastTaskNotificationsSorted()
    this.pendingNormalNotifications = this.prepareNormalNotificationsSorted()
  }

  private prepareFastTaskNotificationsSorted(): PendingLocalNotificationSchema[] {
    const notifications = this.allPendingNotifications.filter(n => n.extra.fastTask)
    return this.prepareNotificationsAndSetDataRange(notifications)
  }

  private prepareNormalNotificationsSorted(): PendingLocalNotificationSchema[] {
    let currentYear = new Date().getFullYear()
    const notifications = this.allPendingNotifications.filter(n => !n.extra.fastTask && new Date(n.schedule.at).getFullYear() == currentYear)
    return this.prepareNotificationsAndSetDataRange(notifications)
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
      
      let pendingMsg = this.allPendingNotifications
        .filter(p => new Date(p.schedule.at).toLocaleDateString("es-ES") == selectedDate).map(p => p.body)

      if (pendingMsg && pendingMsg.length > 0) {
        let msg = `Next tasks: ${pendingMsg.join(", ")}`
        this.helper.showInfoToast(msg, 'hammer', 2000 * pendingMsg.length)
      } else {
        this.helper.dismissToasts()
      }
    }
  }
}
