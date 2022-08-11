import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { PendingLocalNotificationSchema } from '@capacitor/local-notifications';
import { IonicHelperService } from 'src/app/services/ionic-helper.service';
import { LocalNotificationsWrapperService } from 'src/app/services/local-notifications-wrapper.service';

@Component({
  selector: 'app-admin-notifications',
  templateUrl: './admin-notifications.page.html',
  styleUrls: ['./admin-notifications.page.scss'],
})
export class AdminNotificationsPage implements OnInit {

  protected notifications: PendingLocalNotificationSchema[] = []

  constructor(private notif: LocalNotificationsWrapperService, private helper: IonicHelperService) { }

  ngOnInit() {
    this.refreshNotifications();
  }

  private async refreshNotifications() {
    let pendingNotifications = await this.notif.getPending()
    this.notifications = pendingNotifications.sort((n1, n2) => new Date(n1.schedule.at).getTime() - new Date(n2.schedule.at).getTime())
  }

  getIconByNotificationStatus(n: PendingLocalNotificationSchema) {
    return new Date(n.schedule.at).getTime() > Date.now() ? "calendar" : "timer"
  }

  getNotificationSummary(n: PendingLocalNotificationSchema) {
    return `${n.id} ${n.title}: ${new Date(n.schedule.at).toLocaleDateString("es-ES")}`
  }

  notify(seconds: number, exit: boolean) {
    let now = new Date()
    now.setSeconds(now.getSeconds() + seconds)
    this.notif.scheduleMessageAtDates("Hello", [now])

    if (exit) {
      App.exitApp()
    }
  }

  showDeleteNotificationDialog(n: PendingLocalNotificationSchema) {
    this.helper.showDialog("Are you sure?", "Delete the notification?").then((event) => {
      if (event.value) {
        this.deleteNotification(n)
      }
    })
  }

  deleteNotification(n: PendingLocalNotificationSchema) {
    this.notif.deleteNotificationsById(n.id).then(() => this.refreshNotifications())
  }
}
