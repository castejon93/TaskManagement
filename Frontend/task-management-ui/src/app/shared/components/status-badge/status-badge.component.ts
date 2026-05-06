import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly status = input('');

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
