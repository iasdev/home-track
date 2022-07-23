import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { IonicHelperService } from 'src/app/services/ionic-helper.service'
import { LocalNotificationsWrapperService } from 'src/app/services/local-notifications-wrapper.service'
import { StorageWrapperService } from 'src/app/services/storage-wrapper.service'

@Component({
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
})
export class TaskPage implements OnInit {

  protected now = new Date().toISOString()
  private fastTaskRepeatTimes = 10
  private nonFastTaskRepeatTimes = 5

  private everyWeeksMaxValue = 12 * 4
  private everyMonthsMaxValue = 12
  private repeatTimesMinValue = 3
  private repeatTimesMaxValue = 20

  protected form = new FormGroup({
    id: new FormControl(),
    name: new FormControl('', Validators.required),
    startDate: new FormControl(new Date()),
    everyWeeks: new FormControl(null, this.isFastTask() ? [] : [Validators.required, Validators.max(this.everyWeeksMaxValue)]),
    everyMonths: new FormControl(null, this.isFastTask() ? [] : [Validators.required, Validators.max(this.everyMonthsMaxValue)]),
    repeatTimes: new FormControl(this.getDefaultRepeatTimes(), [
      Validators.required, Validators.min(this.repeatTimesMinValue), Validators.max(this.repeatTimesMaxValue)
    ]),
    fastTask: new FormControl(false)
  })

  task: any

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageWrapperService,
    private notif: LocalNotificationsWrapperService,
    private helper: IonicHelperService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadTask(params['id'])
      }
    })
  }

  getDefaultRepeatTimes() {
    return this.isFastTask() ? this.fastTaskRepeatTimes : this.nonFastTaskRepeatTimes
  }

  isFastTask() {
    return (this.task && this.task.fastTask) || this.router.url.indexOf('fast-task') != -1
  }

  loadTask(taskId: number) {
    this.task = this.storage.getTask(taskId)

    if (this.task) {
      this.form.setValue(this.task)
    }
  }

  getTitle() {
    if (this.isFastTask()) {
      return "New fast task"
    }

    return this.task ? "Edit task" : "New task"
  }

  onStartDateChange(event) {
    if (event && event.detail && event.detail.value) {
      let selectedDate = new Date(event.detail.value)
      this.form.patchValue({startDate: selectedDate})
    }
  }

  save() {
    let taskData = this.form.value
    taskData.fastTask = this.isFastTask()

    if (this.task) {
      this.storage.updateTask(taskData)
      this.notif.deleteNotificationsByTitle(taskData.name)
    } else {
      this.storage.createTask(taskData)
    }

    let scheduled = this.isFastTask() ? this.notif.createFastTaskNotif(taskData) : this.notif.createNormalTaskNotif(taskData)
    if (scheduled) {
      this.helper.showInfoToast("Notifications ready!", "add-circle-outline")
      this.router.navigate(['pending'])
    } else {
      this.helper.showInfoToast("Error creating notifications...")
    }
  }

}

