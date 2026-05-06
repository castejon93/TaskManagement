import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Reusable page layout shell used by both list pages.
 *
 * Usage:
 *   <app-page-shell [loading]="loading()">
 *     <!-- left side: title, filters, etc. -->
 *     <ng-container pageStart>...</ng-container>
 *     <!-- right side: action buttons -->
 *     <button pageEnd ...>New Item</button>
 *     <!-- the main content (table) — hidden while loading -->
 *     <table pageContent ...>...</table>
 *   </app-page-shell>
 */
@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-content>
          <div class="action-bar">
            <div class="action-bar-start">
              <ng-content select="[pageStart]" />
            </div>
            <div class="action-bar-end">
              <ng-content select="[pageEnd]" />
            </div>
          </div>

          @if (loading()) {
            <div class="spinner-wrapper"><mat-spinner diameter="48" /></div>
          }
          <div [style.display]="loading() ? 'none' : ''">
            <ng-content select="[pageContent]" />
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .action-bar {
      display: flex; align-items: flex-start;
      justify-content: space-between; flex-wrap: wrap;
      gap: 12px; padding: 8px 0 16px;
    }
    .action-bar-start { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .action-bar-end   { display: flex; gap: 8px;  align-items: center; padding-top: 4px; }
    .spinner-wrapper  { display: flex; justify-content: center; padding: 48px; }
  `]
})
export class PageShellComponent {
  readonly loading = input(false);
}
