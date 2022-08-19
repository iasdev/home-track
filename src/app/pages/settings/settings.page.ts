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

  constructor(
    private helper: IonicHelperService,
    private storage: StorageWrapperService,
    private notif: LocalNotificationsWrapperService,
    private fs: FilesystemWrapperService,
    private router: Router
  ) { }

  ngOnInit() {
    
  }

  backup() {
    let tasksJson = JSON.stringify(this.storage.getTasks())
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
        restoredTasks.forEach(t => this.notif.createTaskNotif(t))
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

  dev() {
    const date = new Date()
    const dates = Array(2).fill(0).map(x => new Date(date.setSeconds(date.getSeconds() + 5)))
    this.notif.scheduleMessageAtDates(Math.random()*1000+"", dates)
  }

}
