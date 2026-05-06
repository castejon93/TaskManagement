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
  template: `
    <div class="form-actions">
      <button mat-raised-button class="btn-cancel" type="button" (click)="cancelled.emit()">
        <mat-icon>arrow_back</mat-icon> Cancel
      </button>
      <button mat-raised-button class="btn-create" type="submit" [disabled]="disabled()">
        <mat-icon>{{ submitIcon() }}</mat-icon> {{ submitLabel() }}
      </button>
    </div>
  `,
  styles: [`.form-actions { display: flex; justify-content: flex-end; gap: 8px; }`]
})
export class FormActionsComponent {
  readonly submitLabel = input('Submit');
  readonly submitIcon  = input('save');
  readonly disabled    = input(false);
  readonly cancelled   = output<void>();
}
