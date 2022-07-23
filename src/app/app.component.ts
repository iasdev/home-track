import { Component, OnInit } from '@angular/core'
import { App } from '@capacitor/app'
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

  constructor(private storage: StorageWrapperService) {
    this.storage.prepareData()
  }

  ngOnInit() {
    this.randomMessage = this.getRandomMessage()
  }

  getRandomMessage() : string {
    let random = Math.random()*this.randomMessages.length
    let index = parseInt(random.toString())
    return this.randomMessages[index]
  }

  exitApp() {
    App.exitApp()
  }
}
