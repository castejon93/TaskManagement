import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class]="badgeClass()">{{ status }}</span>`,
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .status-pending    { background-color: rgba(88, 166, 255, 0.18); color: #58a6ff; }
    .status-inprogress { background-color: rgba(210, 153, 34,  0.2);  color: #e3b341; }
    .status-done       { background-color: rgba(63,  185, 80,  0.15); color: #3fb950; }
  `]
})
export class StatusBadgeComponent {
  private readonly _status = signal<string>('');

  @Input() set status(value: string) { this._status.set(value); }
  get status(): string { return this._status(); }

  readonly badgeClass = computed(() => {
    switch (this._status()) {
      case 'Pending':    return 'status-badge status-pending';
      case 'InProgress': return 'status-badge status-inprogress';
      case 'Done':       return 'status-badge status-done';
      default:           return 'status-badge';
    }
  });
}
