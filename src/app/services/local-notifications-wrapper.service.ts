import { Injectable } from '@angular/core'
import { LocalNotifications, PendingLocalNotificationSchema, ScheduleResult } from '@capacitor/local-notifications'

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationsWrapperService {

  private fastTaskHour = 22
  private fastTaskMinutes = 0

  private taskHour = 10
  private taskMinutes = 0

  private maxSupportedYear = 2075
  private maxSupportedNotificationsAtOnce = 250

  constructor() {
    // LocalNotifications.registerActionTypes({
    //   types: [
    //     {id: "task", "actions": [{id: "done", title: "Done!"}, {id: "notDone", title: "Not done"}]},
    //   ]
    // })

    // LocalNotifications.addListener("localNotificationReceived", (event) => {
    //   alert("received: " + event.title) //
    // })

    // LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
    //   alert("performed: " + event.actionId) // [tap, done, notDone]
    // })
  }

  async getPending(): Promise<PendingLocalNotificationSchema[]> {
    let pendingData = await LocalNotifications.getPending()
    return pendingData.notifications
  }

  async deleteNotificationsByTitle(title: string) {
    let notifications = await this.getPending()
    let notificationsToCancel = notifications.filter(n => n.title == title)
    this.deleteAll(notificationsToCancel)
  }

  async deleteNotificationsById(id: number) {
    let notifications = await this.getPending()
    let notificationsToCancel = notifications.filter(n => n.id == id)
    this.deleteAll(notificationsToCancel)
  }

  async deleteAll(notificationsToCancel?: PendingLocalNotificationSchema[]) {
    let notifications = notificationsToCancel ? notificationsToCancel : await this.getPending()
    LocalNotifications.cancel({ notifications: notifications })
  }

  scheduleMessageAtDate(msg: string, atDate: Date) {
    let now = Date.now()

    return LocalNotifications.schedule({
      notifications: [
        {
          id: now,
          title: `Title: ${msg} - ${now}`,
          body: `Msg: ${msg}`,
          schedule: { at: atDate },
          extra: { test: true }
          //ongoing: true,
          //autoCancel: false
        },
      ],
    })
  }

  private schedule(task, at: Date[]): Promise<ScheduleResult> {
    const now = Date.now()
    const notificationsToSchedule = at.filter(date => now < date.getTime()).map((date, index) => {
      return {
        id: task.id + (index + 1),
        title: task.name,
        body: task.fastTask ? `${task.name} - ${index}/${task.repeatTimes}` : task.name,
        schedule: { at: date },
        extra: { fastTask: task.fastTask }
        //ongoing: true,
        //autoCancel: false
      }
    })
    const notificationsToSchedulePart = notificationsToSchedule.splice(0, this.maxSupportedNotificationsAtOnce)
    return LocalNotifications.schedule({notifications: notificationsToSchedulePart})
  }

  createFastTaskNotif(task: any): Promise<ScheduleResult> {
    let startDate = new Date(typeof task.startDate == "string" ? new Date(task.startDate).getTime() : task.startDate.getTime())
    let startDateStr = startDate.toLocaleDateString("es-ES")
    let now = new Date();
    let nowStr = now.toLocaleDateString("es-ES")
    
    let notifDate = startDate
    if (startDateStr == nowStr) {
      notifDate.setHours(this.fastTaskHour)
      notifDate.setMinutes(this.fastTaskMinutes)
    } else {
      notifDate.setHours(this.taskHour)
      notifDate.setMinutes(this.taskMinutes)
    }

    let initialAt = [new Date(notifDate.getTime())]
    let nextAt = Array(task.repeatTimes).fill(0).map(x => new Date(notifDate.setDate(notifDate.getDate() + 1)))
    let at = [...initialAt, ...nextAt]

    return this.schedule(task, at)
  }

  createNormalTaskNotif(task: any): Promise<ScheduleResult> {
    let startDate = new Date(typeof task.startDate == "string" ? new Date(task.startDate).getTime() : task.startDate.getTime())
    let everyWeeks = task.everyWeeks && task.everyWeeks > 0 ? task.everyWeeks : 0
    let everyMonths = task.everyMonths && task.everyMonths > 0 ? task.everyMonths : 0

    let notifDate = new Date(startDate.getTime())
    notifDate.setHours(this.taskHour)
    notifDate.setMinutes(this.taskMinutes)

    let at = []
    while (notifDate.getFullYear() < this.maxSupportedYear) {
      at.push(new Date(notifDate.getTime()))

      let nextAt = Array(task.repeatTimes).fill(0).map(x => new Date(notifDate.setDate(notifDate.getDate() + 1)))
      at.push(...nextAt)

      if (everyMonths > 0) {
        notifDate.setDate(startDate.getDate())
        notifDate.setMonth(notifDate.getMonth() + everyMonths)
      }

      if (everyWeeks > 0) {
        notifDate.setDate(notifDate.getDate() - task.repeatTimes + (everyWeeks * 7))
      }
    }

    return this.schedule(task, at)
  }
}
