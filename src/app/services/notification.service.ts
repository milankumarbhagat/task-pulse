import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly VAPID_PUBLIC_KEY = 'BBesHTe6RWwRl60iW8_zOfJSCsuq8OhNnMh-pjQ30MlXapGykAugItvYsL5YThuHA2CE34qp4CndTCEjzYIjy3k';

  constructor(
    private snackBar: MatSnackBar,
    private swPush: SwPush,
    private http: HttpClient
  ) { }

  success(message: string, duration?: number) {
    this.open(message, 'success-snackbar', duration);
  }

  error(message: string, duration?: number) {
    this.open(message, 'error-snackbar', duration);
  }

  warning(message: string, duration?: number) {
    this.open(message, 'warning-snackbar', duration);
  }

  private open(message: string, panelClass: string, duration?: number) {
    this.snackBar.open(message, 'X', {
      duration: duration || 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: panelClass
    });
  }

  subscribeToNotifications() {
    if (!this.swPush.isEnabled) {
      console.warn('Notifications are not enabled for this browser/environment.');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      this.http.post(`${environment.apiUrl}/notifications/subscribe`, sub).subscribe({
        next: () => console.log('Successfully subscribed to push notifications'),
        error: (err) => console.error('Could not subscribe to push notifications on server', err)
      });
    })
    .catch(err => console.error('Could not request push subscription', err));
  }
}