import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning';

/** Payload held in the notification signal and read by the shell template. */
export interface AppNotification {
  message: string;
  type: NotificationType;
}

/**
 * Signal-based toast notification service.
 * Effects and interceptors call success() / error() to surface feedback.
 * The shell component reads the `notification` signal and renders the banner.
 * Each call replaces any previous notification and resets the auto-dismiss timer.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Null means no active notification; the shell hides the banner when null. */
  readonly notification = signal<AppNotification | null>(null);

  /** Holds the active auto-dismiss timer so it can be cancelled on each new show(). */
  private timer: ReturnType<typeof setTimeout> | null = null;

  success(message: string): void {
    this.show(message, 'success', 4000);
  }

  /** Errors stay on screen longer (6 s) to give users time to read longer messages. */
  error(message: string): void {
    this.show(message, 'error', 6000);
  }

  warning(message: string): void {
    this.show(message, 'warning', 5000);
  }

  /** Allows the user to manually close the notification before the timer fires. */
  dismiss(): void {
    this.notification.set(null);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private show(message: string, type: NotificationType, duration: number): void {
    // Cancel a previous timer so back-to-back notifications each get their full duration.
    if (this.timer) clearTimeout(this.timer);
    this.notification.set({ message, type });
    this.timer = setTimeout(() => this.dismiss(), duration);
  }
}
