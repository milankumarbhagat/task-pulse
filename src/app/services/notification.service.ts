import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) { }

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
}