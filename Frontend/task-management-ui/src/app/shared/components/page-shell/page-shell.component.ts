import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-page-shell',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule],
  templateUrl: './page-shell.component.html',
  styleUrl: './page-shell.component.scss',
})
export class PageShellComponent {
  readonly loading = input(false);
}
