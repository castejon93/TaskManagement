import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { createUser, createUserSuccess } from '../../store/users.actions';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    FormActionsComponent,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
/**
 * Create-user form rendered at /users/new.
 * Dispatches createUser on valid submit and navigates back to /users on success.
 */
export class UserFormComponent {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    /** Validators.email checks RFC-compliant format; the API also validates server-side. */
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    // Navigate away as soon as the API confirms the user was created.
    // takeUntilDestroyed() uses DestroyRef internally — no manual unsubscribe needed.
    this.actions$
      .pipe(ofType(createUserSuccess), takeUntilDestroyed())
      .subscribe(() => this.router.navigate(['/users']));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.store.dispatch(createUser({ request: this.form.getRawValue() as any }));
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
