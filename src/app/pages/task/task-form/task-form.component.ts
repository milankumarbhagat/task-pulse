import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { DueDateBadgeComponent } from '../../../shared/components/due-date-badge/due-date-badge.component';
import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, DueDateBadgeComponent],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  taskId: string | null = null;
  isEditMode = false;
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.taskId;

    this.initForm();

    if (this.isEditMode) {
      this.loadTask();
    } else {
      const state = history.state;
      if (state && state.cloneData) {
        const clone = state.cloneData;
        this.taskForm.patchValue({
          title: `${clone.title} (Clone)`,
          description: clone.description,
          status: clone.status,
          dueDate: this.formatDateForInput(clone.dueDate),
          priority: clone.priority
        });
        this.checkAndDisableDueDate();
      }
    }
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      status: ['PENDING', Validators.required],
      dueDate: ['', Validators.required],
      priority: ['MEDIUM', Validators.required]
    });
  }

  private loadTask(): void {
    this.isLoading = true;
    this.taskService.getTask(this.taskId!).subscribe({
      next: (task: Task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: this.formatDateForInput(task.dueDate),
          priority: task.priority
        });
        this.checkAndDisableDueDate();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.errorMessage = 'Failed to load task details';
        this.isLoading = false;
      }
    });
  }

  private checkAndDisableDueDate(): void {
    if (this.isEditMode) {
      const dueDateValue = this.taskForm.get('dueDate')?.value;
      if (dueDateValue) {
        const todayStr = this.formatDateForInput(new Date());
        // If the task is already overdue or due today, lock it.
        if (dueDateValue <= todayStr) {
          this.taskForm.get('dueDate')?.disable();
        } else {
          // If it's a future task, keep it unlocked so they can still see the calendar!
          this.taskForm.get('dueDate')?.enable();
        }
      }
    }
  }

  private formatDateForInput(dateString: string | Date | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }
    
    this.isSubmitted = true;
    if (this.taskForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const taskData: Task = this.taskForm.getRawValue();

    if (this.isEditMode) {
      this.taskService.updateTask(this.taskId!, taskData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/task']);
        },
        error: (err) => {
          console.error('Error updating task:', err);
          this.errorMessage = 'Failed to update task. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/task']);
        },
        error: (err) => {
          console.error('Error creating task:', err);
          this.errorMessage = 'Failed to create task. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/task']);
  }
}
