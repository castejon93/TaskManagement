import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';

// Attribute directive — adds a background color class to host element
// based on the task's current status string.
// Usage: <mat-card [appHighlightStatus]="task.statusName">
@Directive({
  selector: '[appHighlightStatus]',
  standalone: true,
})
export class HighlightStatusDirective implements OnChanges {
  @Input('appHighlightStatus') status: string = '';

  private readonly el = inject(ElementRef);

  ngOnChanges(): void {
    const el = this.el.nativeElement as HTMLElement;
    // Remove any previously applied status class before applying the new one.
    el.classList.remove('status-pending', 'status-inprogress', 'status-done');

    switch (this.status) {
      case 'Pending':
        el.classList.add('status-pending');
        break;
      case 'InProgress':
        el.classList.add('status-inprogress');
        break;
      case 'Done':
        el.classList.add('status-done');
        break;
    }
  }
}
