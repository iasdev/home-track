import { Injectable } from '@angular/core'
import { ActionPerformed, LocalNotifications, LocalNotificationSchema, PendingLocalNotificationSchema, ScheduleResult } from '@capacitor/local-notifications'
import { BehaviorSubject } from 'rxjs'
import { IonicHelperService } from './ionic-helper.service'
import { StorageWrapperService } from './storage-wrapper.service'

@Injectable({
  providedIn: 'root'
})
export class LocalNotificationsWrapperService {

  private notificationActionConfirmBS = new BehaviorSubject(null)
  private notificationActionCancelBS = new BehaviorSubject(null)
  public onNotificationActionConfirm = this.notificationActionConfirmBS.asObservable()
  public onNotificationActionCancel = this.notificationActionCancelBS.asObservable()

  private todayFirstTaskHour = 22
  private todayFirstTaskMinutes = 0

  private taskHour = 10
  private taskMinutes = 0

  constructor(
    protected helper: IonicHelperService,
    protected storage: StorageWrapperService
  ) {
    LocalNotifications.registerActionTypes({
      types: [
        {id: "task", "actions": [{id: "done", title: "Done"}, {id: "notDone", title: "Not done"}]},
        {id: "reminder", "actions": [{id: "repeatTomorrow", title: "Repeat tomorrow"}]}
      ]
    })
    LocalNotifications.addListener("localNotificationActionPerformed", (action) => this.showOnEventDialog(action))
  }

  showOnEventDialog(action: ActionPerformed) {
    let dialogTitle: string
    let dialogMessage: string

    if ("repeatTomorrow" == action.actionId) {
      dialogTitle = "Repeat tomorrow?"
      dialogMessage = `Do you want to repeat '${action.notification.title}' tomorrow?`
    } else if ("repeatLater" == action.actionId) {
      dialogTitle = "Repeat later?"
      dialogMessage = `Do you want to repeat '${action.notification.title}' later?`
    } else if ("done" == action.actionId) {
      dialogTitle = "Task done"
      dialogMessage = `Did you complete the task '${action.notification.title}'?`
    } else if (action.notification.extra.isLastDate) {
      dialogTitle = "Task expired"
      dialogMessage = `The task expired, did you complete the task '${action.notification.title}'?`
    }

    this.helper.showDialog(dialogTitle, dialogMessage).then((event) => {
      if (event.value) {
        this.notificationActionConfirmBS.next(action.notification)
      } else {
        this.notificationActionCancelBS.next(action.notification)
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
    let now = new Date()
    const id = parseInt(`${now.getDate()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`)

    let scheduleAt = atDates.map((atDate, index) => {
      return {
        id: id + (index + 1),
        title: msg,
        body: msg,
        schedule: { at: atDate },
        actionTypeId: "reminder",
        autoCancel: true
      }
    })

    return LocalNotifications.schedule({ notifications: scheduleAt })
  }

  private schedule(task, atDates: Date[]): Promise<ScheduleResult> {
    const now = new Date()

    atDates = atDates.filter(date => now.getTime() < date.getTime())
    const atDatesTimes = atDates.map(date => date.getTime())
    const minDate = new Date(Math.min(...atDatesTimes))
    const maxDate = new Date(Math.max(...atDatesTimes))

    const notificationsToSchedule = atDates.map((date, index) => {
      const id = parseInt(`${now.getDate()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`)
      const initDate = date.toLocaleDateString("es-ES")
      const endDate = maxDate.toLocaleDateString("es-ES")
      const range = initDate == endDate ? endDate : `${date.toLocaleDateString("es-ES")} - ${maxDate.toLocaleDateString("es-ES")}`
      const isLastNotification = date.toLocaleDateString("es-ES") == maxDate.toLocaleDateString("es-ES")

      return {
        id: id + (index + 1),
        title: task.name,
        body: `${task.name} - ${index}/${task.repeatTimes}`,
        schedule: { at: date },
        extra: { 
          fastTask: task.fastTask, 
          dateRange: range,
          firstDate: minDate.getTime(),
          lastDate: maxDate.getTime(),
          isLastDate: isLastNotification
        },
        actionTypeId: "task",
        ongoing: isLastNotification,
        autoCancel: true
      }
    })

    return LocalNotifications.schedule({ notifications: notificationsToSchedule })
  }

  createTaskNotif(task: any): Promise<ScheduleResult> {
    let now = new Date()
    let startDate = typeof task.startDate == "string" ? new Date(task.startDate) : new Date(task.startDate.getTime())
    let notifDate = new Date(startDate.getTime())
    notifDate.setSeconds(now.getSeconds())
    notifDate.setMilliseconds(now.getMilliseconds())

    let atDates = []
    if (now.toLocaleDateString("es-ES") == notifDate.toLocaleDateString("es-ES")) {
      notifDate.setHours(this.todayFirstTaskHour)
      notifDate.setMinutes(this.todayFirstTaskMinutes)
    } else {
      notifDate.setHours(this.taskHour)
      notifDate.setMinutes(this.taskMinutes)
    }
    atDates.push(notifDate)

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

    notifDate.setDate(notifDate.getDate() - 1)

    let atDates = [notifDate]
    let repeatAtDates = Array(task.repeatTimes).fill(0).map(x => {
      notifDate = new Date(notifDate.getTime())
      notifDate.setDate(notifDate.getDate() + 1)
      return notifDate
    })
    atDates.push(...repeatAtDates)

    return this.schedule(task, repeatAtDates)
  }

  public configureOnNotifActionConfirm() {
    this.onNotificationActionConfirm.subscribe((notification: LocalNotificationSchema) => {
      if (!notification) {
        return
      }

      // reminders
      if (!notification.extra) {
        let originalScheduleAt = new Date(notification.schedule.at)
        originalScheduleAt.setDate(originalScheduleAt.getDate() + 1)
        this.scheduleMessageAtDates(notification.title, [originalScheduleAt])
        window.location.reload()
        return;
      }

      // tasks
      this.deleteNotificationsByTitle(notification.title).then(() => {
        let task = this.storage.getTaskByName(notification.title)

        if (task.fastTask) {
          this.storage.deleteTask(task.id)
          this.helper.showInfoToast("Task completed!", "checkmark-circle")
          window.location.reload()
        } else {
          this.repeatTaskNotif(task).then(() => {
            this.helper.showInfoToast("Task completed and notifications ready again!", "checkmark-circle")
            window.location.reload()
          }).catch(() => {
            this.helper.showErrorToast("Error while repeating task after completed...")
          })
        }
      }).catch(() => {
        this.helper.showErrorToast("Error while deleting notifications...")
      })
    })
  }

  public configureOnNotifActionCancel() {
    this.onNotificationActionCancel.subscribe((notification: LocalNotificationSchema) => {
      if (!notification) {
        return
      }

      if (notification.extra && notification.extra.isLastDate) {
        this.deleteNotificationsByTitle(notification.title).then(() => {
          let task = this.storage.getTaskByName(notification.title)
          task.startDate = new Date()
  
          this.repeatTaskNotif(task).then(() => {
            this.helper.showInfoToast("Task expired but notifications ready again!", "checkmark-circle")
            window.location.reload()
          }).catch(() => {
            this.helper.showErrorToast("Error while repeating task after completed...")
          })
        }).catch(() => {
          this.helper.showErrorToast("Error while deleting notifications...")
        })
      }
    })
  }
}
