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
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
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
