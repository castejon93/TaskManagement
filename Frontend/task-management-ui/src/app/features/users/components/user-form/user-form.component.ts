import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { createUser, createUserSuccess } from '../../store/users.actions';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
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

            <div class="form-actions">
              <button mat-raised-button class="btn-cancel" type="button" (click)="cancel()">
                <mat-icon>arrow_back</mat-icon> Cancel
              </button>
              <button mat-raised-button class="btn-create"
                type="submit" [disabled]="form.invalid">
                <mat-icon>person_add</mat-icon> Create User
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.form-container{padding:24px;max-width:480px;margin:0 auto}.form{display:flex;flex-direction:column;gap:16px}.form-actions{display:flex;justify-content:flex-end;gap:8px}.mat-mdc-card-header{padding-bottom:0!important}.mat-mdc-card-content{padding-top:12px!important}`]
})
export class UserFormComponent implements OnDestroy {
  private readonly store    = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly router   = inject(Router);
  private readonly fb       = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly form = this.fb.group({
    name:  ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    // Navigate back to the dashboard when user is created successfully.
    this.actions$.pipe(ofType(createUserSuccess), takeUntil(this.destroy$))
      .subscribe(() => this.router.navigate(['/users']));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.store.dispatch(createUser({ request: this.form.getRawValue() as any }));
  }

  cancel(): void { this.router.navigate(['/users']); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
