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
    MatFormFieldModule, MatInputModule,
    MatIconModule, MatCardModule,
    FormActionsComponent,
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create New User</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" placeholder="Full name" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>Name is required.</mat-error>
              }
              @if (form.get('name')?.hasError('maxlength')) {
                <mat-error>Name cannot exceed 100 characters.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" placeholder="email@example.com" />
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required.</mat-error>
              }
              @if (form.get('email')?.hasError('email')) {
                <mat-error>Enter a valid email address.</mat-error>
              }
            </mat-form-field>

            <app-form-actions
              submitLabel="Create User"
              submitIcon="person_add"
              [disabled]="form.invalid"
              (cancelled)="cancel()" />
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.form-container{padding:24px;max-width:480px;margin:0 auto}.form{display:flex;flex-direction:column;gap:16px}.mat-mdc-card-header{padding-bottom:0!important}.mat-mdc-card-content{padding-top:12px!important}`]
})
export class UserFormComponent {
  private readonly store    = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly router   = inject(Router);
  private readonly fb       = inject(FormBuilder);

  readonly form = this.fb.group({
    name:  ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    // Navigate back to the dashboard when user is created successfully.
    this.actions$.pipe(ofType(createUserSuccess), takeUntilDestroyed())
      .subscribe(() => this.router.navigate(['/users']));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.store.dispatch(createUser({ request: this.form.getRawValue() as any }));
  }

  cancel(): void { this.router.navigate(['/users']); }
}
