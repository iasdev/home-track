import { Injectable, OnInit } from '@angular/core'
import { Storage } from '@capacitor/storage'
import { IonicHelperService } from './ionic-helper.service'

@Injectable({
  providedIn: 'root'
})
export class StorageWrapperService {
  private tasks: any[]

  constructor(private helper: IonicHelperService) {}

  prepareData() {
    Storage.get({key: 'tasks'}).then((stored) => {
      this.tasks = stored.value ? JSON.parse(stored.value) : []
    }).catch((err) => {
      this.tasks = []
      console.log(err)
      this.helper.showErrorToast("Error while reading tasks..." + err)
    })
  }

  private saveData() {
    Storage.set({key: 'tasks', value: JSON.stringify(this.tasks)})
  }

  getTasks() {
    return this.tasks.sort((t1, t2) => t2.fastTask.toString().localeCompare(t1.fastTask.toString()))
  }

  getTask(id: number) {
    return this.tasks.find(t => t.id == id)
  }

  createTask(task, id?: number) {
    task.id = id ? id : Date.now()
    this.tasks.push(task)
    this.saveData()
  }

  updateTask(task) {
    if (!task || !task.id) {
      console.log("updateTask: No id was provided")
      return
    }

    let taskFound = this.tasks.find(t => t.id == task.id)
    if (taskFound) {
      this.deleteTask(taskFound.id);
      this.tasks.push(task);
      this.saveData();
    } else {
      console.log("updateTask: No task was found with id: " + task.id)
    }
    this.saveData()
  }

  deleteTask(id: number): boolean {
    let tasksBeforeDelete = this.tasks.length
    let remaining = this.tasks.filter(t => t.id != id)
    this.tasks = remaining
    let tasksAfterDelete = this.tasks.length
    this.saveData()

    return tasksAfterDelete < tasksBeforeDelete
  }

  deleteAll() {
    this.tasks.splice(0, this.tasks.length)
    this.saveData()
  }

  restoreTasks(tasks: any[]): any[] {
    let storedTasks = this.getTasks()
    storedTasks.forEach(t => this.deleteTask(t.id))

    if (tasks && tasks.length > 0) {
      tasks.forEach((t, i) => this.createTask(t, Date.now() + i))
    }
    
    return this.getTasks()
  }
}
