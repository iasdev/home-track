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
  private defaultTaskRepeatTimes = 3

  private repeatTimesMinValue = 3
  private repeatTimesMaxValue = 20
  private everyWeeksMinValue = 1
  private everyWeeksMaxValue = 12 * 4
  private everyMonthsMinValue = 1
  private everyMonthsMaxValue = 12

  private everyWeeksValidations = [Validators.required, Validators.min(this.everyWeeksMinValue), Validators.max(this.everyWeeksMaxValue)]
  private everyMonthsValidations = [Validators.required, Validators.min(this.everyMonthsMinValue), Validators.max(this.everyMonthsMaxValue)]

  protected form = new FormGroup({
    id: new FormControl(),
    name: new FormControl(null, Validators.required),
    startDate: new FormControl(),
    everyWeeks: new FormControl(null, this.isFastTask() ? null : this.everyWeeksValidations),
    everyMonths: new FormControl(null, this.isFastTask() ? null : this.everyMonthsValidations),
    repeatTimes: new FormControl(null, [
      Validators.required, Validators.min(this.repeatTimesMinValue), Validators.max(this.repeatTimesMaxValue)
    ]),
    fastTask: new FormControl()
  })

  task: any

  constructor(
    private router: Router,
    private storage: StorageWrapperService,
    private notif: LocalNotificationsWrapperService,
    private helper: IonicHelperService
  ) { }

  ngOnInit() {
    this.resetFormAndSetDefaultValues()
  }

  resetFormAndSetDefaultValues() {
    this.form.reset()
    this.form.patchValue({
      name: '',
      startDate: new Date(),
      repeatTimes: this.defaultTaskRepeatTimes,
      fastTask: false
    })
  }

  isFastTask() {
    return (this.task && this.task.fastTask) || this.router.url.indexOf('fast-task') != -1
  }

  getTitle() {
    if (this.isFastTask()) {
      return "New fast task"
    }

    return this.task ? "Edit task" : "New task"
  }

  onEveryWeeksChange() {
    this.form.controls.everyMonths.setValidators(this.form.controls.everyWeeks.valid ? null : this.everyMonthsValidations)
    this.form.controls.everyMonths.updateValueAndValidity()
  }

  onEveryMonthChange() {
    this.form.controls.everyWeeks.setValidators(this.form.controls.everyMonths.valid ? null : this.everyWeeksValidations)
    this.form.controls.everyWeeks.updateValueAndValidity()
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

    this.storage.createTask(taskData)
    this.resetFormAndSetDefaultValues()

    this.notif.createTaskNotif(taskData).then(() => {
      this.helper.showInfoToast("Notifications ready!", "add-circle-outline")
      this.router.navigate(['pending'])
    }).catch(() => {
      this.helper.showInfoToast("Error creating notifications...")
    })
  }
}

