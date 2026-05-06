import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { selectAllUsers } from '../../../users/store/users.selectors';
import { createTask, createTaskSuccess } from '../../store/tasks.actions';
import { serializeMetadata } from '../../../../core/utils/metadata.utils';
import { FormActionsComponent } from '../../../../shared/components/form-actions/form-actions.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    FormActionsComponent,
  ],
  template: `
    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create New Task</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" placeholder="Task title" />
              @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                <mat-error>Title is required.</mat-error>
              }
              @if (form.get('title')?.hasError('maxlength')) {
                <mat-error>Title cannot exceed 200 characters.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="3"
                placeholder="Description"
              ></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Assign to User</mat-label>
              <mat-select formControlName="userId">
                @for (user of users(); track user.id) {
                  <mat-option [value]="user.id">{{ user.name }}</mat-option>
                }
              </mat-select>
              @if (form.get('userId')?.hasError('required') && form.get('userId')?.touched) {
                <mat-error>User is required.</mat-error>
              }
            </mat-form-field>

            <mat-expansion-panel class="meta-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>Additional Info</mat-panel-title>
                <mat-panel-description>Custom fields</mat-panel-description>
              </mat-expansion-panel-header>

              <div class="meta-fields">
                @for (field of customFields(); track $index) {
                  <div class="custom-field-row">
                    <span class="custom-field-label">{{ field.key }}:</span>
                    <span class="custom-field-value">{{ field.value }}</span>
                    <button mat-icon-button type="button" (click)="removeCustomField($index)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }

                <div class="custom-field-add-row">
                  <mat-form-field appearance="outline" class="cf-key">
                    <mat-label>Field name</mat-label>
                    <input matInput [formControl]="cfKey" />
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="cf-val">
                    <mat-label>Value</mat-label>
                    <input matInput [formControl]="cfValue" />
                  </mat-form-field>
                  <button mat-stroked-button type="button" (click)="addCustomField()">
                    <mat-icon>add</mat-icon> Add
                  </button>
                </div>
              </div>
            </mat-expansion-panel>

            <app-form-actions
              submitLabel="Create Task"
              submitIcon="add_task"
              [disabled]="form.invalid"
              (cancelled)="cancel()" />
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .form-container {
        padding: 24px;
        max-width: 600px;
        margin: 0 auto;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .mat-mdc-card-header {
        padding-bottom: 0 !important;
      }
      .mat-mdc-card-content {
        padding-top: 12px !important;
      }
      .meta-panel {
        background: transparent !important;
        box-shadow: none !important;
        border: 1px solid #30363d !important;
        border-radius: 6px !important;
      }
      .meta-fields {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-top: 8px;
      }
      .custom-field-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(88, 166, 255, 0.06);
      }
      .custom-field-label {
        font-weight: 600;
        color: #8b949e;
        font-size: 13px;
      }
      .custom-field-value {
        flex: 1;
        font-size: 13px;
        color: #e6edf3;
      }
      .custom-field-add-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .cf-key {
        flex: 1;
      }
      .cf-val {
        flex: 1.5;
      }
    `,
  ],
})
export class TaskFormComponent {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly users = toSignal(this.store.select(selectAllUsers), { initialValue: [] });

  readonly customFields = signal<{ key: string; value: string }[]>([]);
  readonly cfKey = new FormControl('');
  readonly cfValue = new FormControl('');

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [null],
    userId: [null, Validators.required],
  });

  constructor() {
    this.actions$
      .pipe(ofType(createTaskSuccess), takeUntilDestroyed())
      .subscribe(() => this.router.navigate(['/tasks']));
  }

  addCustomField(): void {
    const key = this.cfKey.value?.trim();
    const val = this.cfValue.value?.trim();
    if (!key || !val) return;
    this.customFields.update((fields) => [...fields, { key, value: val }]);
    this.cfKey.reset('');
    this.cfValue.reset('');
  }

  removeCustomField(index: number): void {
    this.customFields.update((fields) => fields.filter((_, i) => i !== index));
  }

  submit(): void {
    if (this.form.invalid) return;
    // Auto-include any field the user typed but didn't click "Add" for yet.
    this.addCustomField();
    const { title, description, userId } = this.form.getRawValue();
    const meta = {
      customFields: Object.fromEntries(this.customFields().map((f) => [f.key, f.value])),
    };
    this.store.dispatch(
      createTask({
        request: { title, description, userId, additionalInfo: serializeMetadata(meta) },
      }),
    );
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }
}
