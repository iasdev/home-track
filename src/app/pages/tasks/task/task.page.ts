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

  protected repeatTimesMinValue = 3
  protected repeatTimesMaxValue = 20
  protected everyWeeksMinValue = 1
  protected everyWeeksMaxValue = 12 * 4
  protected everyMonthsMinValue = 1
  protected everyMonthsMaxValue = 12

  private everyWeeksValidations = [Validators.required, Validators.min(this.everyWeeksMinValue), Validators.max(this.everyWeeksMaxValue)]
  private everyMonthsValidations = [Validators.required, Validators.min(this.everyMonthsMinValue), Validators.max(this.everyMonthsMaxValue)]
  private repeatTimesValidations = [Validators.required, Validators.min(this.repeatTimesMinValue), Validators.max(this.repeatTimesMaxValue)]

  protected form = new FormGroup({
    id: new FormControl(),
    name: new FormControl(null, Validators.required),
    startDate: new FormControl(),
    everyWeeks: new FormControl(null, !this.currentURL("fast-task") && !this.currentURL("reminder") ? this.everyWeeksValidations : null),
    everyMonths: new FormControl(null, !this.currentURL("fast-task") && !this.currentURL("reminder") ? this.everyMonthsValidations : null),
    repeatTimes: new FormControl(null, !this.currentURL("reminder") ? this.repeatTimesValidations : null),
    fastTask: new FormControl()
  })

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

  currentURL(urlPart: string) {
    return this.router.url.indexOf(urlPart) != -1
  }

  getTitle() {
    if (this.currentURL("fast-task")) {
      return "New fast task"
    } else if (this.currentURL("reminder")) {
      return "New reminder"
    } else {
      return "New task"
    }
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
    
    if (this.currentURL("reminder")) {
      this.notif.scheduleMessageAtDates(taskData.name, [taskData.startDate]).then(() => {
        this.helper.showInfoToast("Reminder ready!", "timer")
        this.router.navigate(['pending'])
      }).catch(() => {
        this.helper.showInfoToast("Error creating reminder...")
      })
    } else {
      taskData.fastTask = this.currentURL("fast-task")
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
}

