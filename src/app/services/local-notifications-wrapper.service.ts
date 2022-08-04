import { Injectable } from '@angular/core'
import { ActionPerformed, LocalNotifications, PendingLocalNotificationSchema, ScheduleResult } from '@capacitor/local-notifications'
import { IonicHelperService } from './ionic-helper.service'

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationsWrapperService {

  private todayFirstTaskHour = 22
  private todayFirstTaskMinutes = 0

  private taskHour = 10
  private taskMinutes = 0

  constructor(protected helper: IonicHelperService) {
    LocalNotifications.registerActionTypes({
      types: [
        {id: "task", "actions": [{id: "done", title: "Done"}, {id: "notDone", title: "Not done"}]},
      ]
    })

    LocalNotifications.addListener("localNotificationActionPerformed", (event) => this.showOnDoneDialog(event))
  }

  showOnDoneDialog(action: ActionPerformed) {
    this.helper.showDialog("Are you sure?", "Did you complete the task?").then((event) => {
      if (event.value) {
        if ("done" == action.actionId) {
          alert("task done WIP")
        }
      }
    })
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

  scheduleMessageAtDates(msg: string, atDates: Date[]) {
    let now = Date.now()
    let scheduleAt = atDates.map((atDate, index) => {
      return {
        id: now + (index + 1),
        title: `Title: ${msg} - ${now}`,
        body: `Msg: ${msg}`,
        schedule: { at: atDate },
        extra: { test: true },
        actionTypeId: "task",
        autoCancel: false
      }
    })

    return LocalNotifications.schedule({ notifications: scheduleAt })
  }

  private schedule(task, atDates: Date[]): Promise<ScheduleResult> {
    const now = Date.now()

    atDates = atDates.filter(date => now < date.getTime())
    const atDatesTimes = atDates.map(date => date.getTime())
    const minDate = new Date(Math.min(...atDatesTimes))
    const maxDate = new Date(Math.max(...atDatesTimes))

    const notificationsToSchedule = atDates.map((date, index) => {
      return {
        id: task.id + (index + 1),
        title: task.name,
        body: task.fastTask ? `${task.name} - ${index}/${task.repeatTimes}` : task.name,
        schedule: { at: date },
        extra: { 
          fastTask: task.fastTask, 
          dateRange: `${minDate.toLocaleDateString("es-ES")} - ${maxDate.toLocaleDateString("es-ES")}`,
          firstDate: minDate.getTime(),
          lastDate: maxDate.getTime()
        },
        actionTypeId: "task",
        autoCancel: false
      }
    })

    return LocalNotifications.schedule({ notifications: notificationsToSchedule })
  }

  createTaskNotif(task: any): Promise<ScheduleResult> {
    let now = new Date();
    let notifDate = typeof task.startDate == "string" ? new Date(task.startDate) : new Date(task.startDate.getTime())

    let atDates = []
    if (now.toLocaleDateString("es-ES") == notifDate.toLocaleDateString("es-ES")) {
      notifDate.setHours(this.todayFirstTaskHour)
      notifDate.setMinutes(this.todayFirstTaskMinutes)
      atDates.push(notifDate)
    }

    let repeatAtDates = Array(task.repeatTimes).fill(0).map(x => {
      notifDate = new Date(notifDate.getTime())
      notifDate.setDate(notifDate.getDate() + 1)
      notifDate.setHours(this.taskHour)
      notifDate.setMinutes(this.taskMinutes)
      return notifDate
    })
    atDates.push(...repeatAtDates)

    return this.schedule(task, atDates)
  }

  repeatTaskNotif(task: any): Promise<ScheduleResult> {
    if (task.fastTask) {
      return this.createTaskNotif(task)
    }

    let notifDate = typeof task.startDate == "string" ? new Date(task.startDate) : new Date(task.startDate.getTime())
    notifDate.setHours(this.taskHour)
    notifDate.setMinutes(this.taskMinutes)

    let everyMonths = task.everyMonths && task.everyMonths > 0 ? task.everyMonths : 0
    if (everyMonths > 0) {
      notifDate.setMonth(notifDate.getMonth() + everyMonths)
    }
    
    let everyWeeks = task.everyWeeks && task.everyWeeks > 0 ? task.everyWeeks : 0
    if (everyWeeks > 0) {
      notifDate.setDate(notifDate.getDate() + (everyWeeks * 7))
    }

    let atDates = [notifDate]
    let repeatAtDates = Array(task.repeatTimes).fill(0).map(x => {
      notifDate = new Date(notifDate.getTime())
      notifDate.setDate(notifDate.getDate() + 1)
      return notifDate
    })
    atDates.push(...repeatAtDates)

    return this.schedule(task, repeatAtDates)
  }
}
