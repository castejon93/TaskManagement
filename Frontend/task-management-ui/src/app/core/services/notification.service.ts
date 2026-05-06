import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning';

export interface AppNotification {
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notification = signal<AppNotification | null>(null);

  private timer: ReturnType<typeof setTimeout> | null = null;

  success(message: string): void {
    this.show(message, 'success', 4000);
  }
  error(message: string): void {
    this.show(message, 'error', 6000);
  }
  warning(message: string): void {
    this.show(message, 'warning', 5000);
  }

  dismiss(): void {
    this.notification.set(null);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private show(message: string, type: NotificationType, duration: number): void {
    if (this.timer) clearTimeout(this.timer);
    this.notification.set({ message, type });
    this.timer = setTimeout(() => this.dismiss(), duration);
  }
}
