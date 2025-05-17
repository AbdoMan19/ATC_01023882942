import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<{ message: string; type: 'success' | 'error' }>();

  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showError(message: string, duration = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  getNotifications(): Observable<{ message: string; type: 'success' | 'error' }> {
    return this.notificationSubject.asObservable();
  }
} 