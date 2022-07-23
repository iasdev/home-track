import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { FilesystemWrapperService } from 'src/app/services/filesystem-wrapper.service';
import { IonicHelperService } from 'src/app/services/ionic-helper.service';
import { LocalNotificationsWrapperService } from 'src/app/services/local-notifications-wrapper.service';
import { StorageWrapperService } from 'src/app/services/storage-wrapper.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  protected tasks: any[]

  constructor(
    private helper: IonicHelperService,
    private storage: StorageWrapperService,
    private notif: LocalNotificationsWrapperService,
    private fs: FilesystemWrapperService,
    private router: Router
  ) { }

  ngOnInit() {
    this.tasks = this.storage.getTasks()
  }

  backup() {
    let tasksJson = JSON.stringify(this.tasks)
    let backupFileName = `${Date.now()}.json`

    this.fs.write(tasksJson, backupFileName).then((result) => {
      if (result && result.uri) {
        this.helper.showInfoToast(`Backup done. (File: ${backupFileName})`, "arrow-down-circle")
      }
    }).catch((err) => {
        console.log(err)
        this.helper.showErrorToast("Write backup file failed... " + err)
    })
  }

  async restore() {
    let allFiles = await this.fs.listFiles()
    let fileNames = allFiles.map(f => parseInt(f.split(".json")[0]))
    let lastCreatedFileName = Math.max(...fileNames).toString()
    let lastCreatedFile = allFiles.find(f => f.includes(lastCreatedFileName))

    this.fs.read(lastCreatedFile).then((result) => {
      if (result && result.data) {
        let toRestoreTasks = JSON.parse(result.data)
        let restoredTasks = this.storage.restoreTasks(toRestoreTasks)
        restoredTasks.forEach(t => t.fastTask ? this.notif.createFastTaskNotif(t) : this.notif.createNormalTaskNotif(t))
        this.helper.showInfoToast(`Tasks restored: ${restoredTasks.length} (File: ${lastCreatedFile})`, "arrow-up-circle")
        this.router.navigate(['tasks'])
      }
    }).catch((err) => {
        console.log(err)
        this.helper.showErrorToast("Read restore file failed... " + err)
    })
  }

  showRestoreDialog() {
    this.helper.showDialog("Are you sure?", "Restore backup file will reset current data, continue?").then((event) => {
      if (event.value) {
        this.restore()
      }
    })
  }

  deleteAll() {
    this.notif.deleteAll()
    this.storage.deleteAll()
    this.router.navigate(['tasks'])
  }

  showDeleteAllDataDialog() {
    this.helper.showDialog("Are you sure?", "Delete all data?").then((event) => {
      if (event.value) {
        this.deleteAll()
      }
    })
  }

  notify(seconds: number, exit: boolean) {
    let now = new Date()
    now.setSeconds(now.getSeconds() + seconds)
    this.notif.scheduleMessageAtDate("Hello", now)

    if (exit) {
      App.exitApp()
    }
  }

  dev() {
    this.helper.showInfoToast("Nothing to see here", "skull")
  }

}
