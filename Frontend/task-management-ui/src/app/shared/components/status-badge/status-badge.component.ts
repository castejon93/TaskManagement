import { Component, computed, input } from '@angular/core';

/**
 * Shared presentational component that renders a coloured status pill.
 * Accepts a status name string via the `status` input and derives a CSS
 * class name via a computed signal — no direct DOM manipulation required.
 *
 * Usage: <app-status-badge [status]="task.statusName" />
 */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  /** The status name string bound from the parent template (e.g. 'Pending'). */
  readonly status = input('');

  /**
   * Derived CSS class string — recomputed only when `status` changes.
   * New statuses added to the database require a matching case and SCSS rule.
   */
  readonly badgeClass = computed(() => {
    switch (this.status()) {
      case 'Pending':
        return 'status-badge status-pending';
      case 'In Progress':
        return 'status-badge status-inprogress';
      case 'Done':
        return 'status-badge status-done';
      default:
        return 'status-badge';
    }
  });
}
