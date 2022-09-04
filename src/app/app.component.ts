import { Component, OnInit } from '@angular/core'
import { App } from '@capacitor/app'
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
    { title: 'Reminder', url: '/reminder', icon: 'time' },
  ]
  protected downMenuOptions = [
    { title: 'Settings', url: '/settings', icon: 'settings' }
  ]
  protected randomMessage: string

  constructor(
    private storage: StorageWrapperService,
    private notif: LocalNotificationsWrapperService
  ) {
    this.storage.prepareData()
  }

  ngOnInit() {
    this.randomMessage = this.getRandomMessage()
    this.notif.configureOnNotifActionConfirm()
    this.notif.configureOnNotifActionCancel()
  }

  getRandomMessage(): string {
    let random = Math.random() * this.randomMessages.length
    let index = parseInt(random.toString())
    return this.randomMessages[index]
  }

  exitApp() {
    App.exitApp()
  }
}
