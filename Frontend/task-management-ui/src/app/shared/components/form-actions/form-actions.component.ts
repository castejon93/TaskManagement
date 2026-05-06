import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable cancel/submit button row used at the bottom of both form pages.
 *
 * Usage:
 *   <app-form-actions
 *     submitLabel="Create Task"
 *     submitIcon="add_task"
 *     [disabled]="form.invalid"
 *     (cancelled)="cancel()" />
 */
@Component({
  selector: 'app-form-actions',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './form-actions.component.html',
  styleUrl: './form-actions.component.scss',
})
export class FormActionsComponent {
  readonly submitLabel = input('Submit');
  readonly submitIcon = input('save');
  readonly disabled = input(false);
  readonly cancelled = output<void>();
}
