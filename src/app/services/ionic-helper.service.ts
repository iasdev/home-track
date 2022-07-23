import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Dialog } from '@capacitor/dialog';

@Injectable({
  providedIn: 'root'
})
export class IonicHelperService {

  private toasts: HTMLIonToastElement[] = []

  constructor(private toastController: ToastController) { }

  dismissToasts() {
    this.toasts.forEach(t => t.dismiss())
    this.toasts = []
  }

  private presentAndSaveToast(toast: HTMLIonToastElement) {
    toast.present()
    this.toasts.push(toast)
  }

  async showInfoToast(msg: string, iconName?: string, durationMillis: number = 3000) {
    this.dismissToasts()

    let newToast = await this.toastController.create({
      position: 'bottom',
      message: msg,
      duration: durationMillis,
      color: "primary",
      icon: iconName
    })

    this.presentAndSaveToast(newToast)
  }

  async showErrorToast(msg: string, durationMillis: number = 3000) {
    this.dismissToasts()

    let newToast = await this.toastController.create({
      position: 'bottom',
      message: msg,
      duration: durationMillis,
      color: "danger",
      icon: "alert-circle"
    })

    this.presentAndSaveToast(newToast)
  }

  showDialog(title: string, msg: string) {
    return Dialog.confirm({
      title: title,
      message: msg,
      okButtonTitle: "Yes",
      cancelButtonTitle: "No"
    })
  }
}
