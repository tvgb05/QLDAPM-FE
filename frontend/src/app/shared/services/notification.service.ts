import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  notifications = this.notifications$.asObservable();
  private nextId = 0;

  show(type: NotificationType, message: string, duration: number = 5000): void {
    const id = this.nextId++;
    const notification: Notification = { id, type, message, duration };
    
    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  showSuccess(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  showError(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  showInfo(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  showWarning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  remove(id: number): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter((n) => n.id !== id));
  }
}
