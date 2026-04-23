import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DueDateBadgeComponent } from '../../../shared/components/due-date-badge/due-date-badge.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatMenuModule, MatButtonModule, ButtonComponent, DueDateBadgeComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  isLoading = true;

  searchQuery: string = '';
  selectedStatuses: string[] = []; // Changed to array for multi-select
  selectedPriorities: string[] = []; // Changed to array for multi-select
  showFilters: boolean = false;
  readonly TaskStatus = TaskStatus; // Expose to template

  get activeFiltersCount(): number {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    count += this.selectedStatuses.length;
    count += this.selectedPriorities.length;
    return count;
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      // If no statuses selected, hide COMPLETED by default
      const matchStatus = this.selectedStatuses.length > 0 
        ? this.selectedStatuses.includes(task.status) 
        : task.status !== TaskStatus.COMPLETED;

      const matchPriority = this.selectedPriorities.length > 0 
        ? this.selectedPriorities.includes(task.priority) 
        : true;
      return matchSearch && matchStatus && matchPriority;
    });
  }

  constructor(private taskService: TaskService, private router: Router, private eRef: ElementRef) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        
        this.tasks = tasks.sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          
          // 1. Sort by Due Date (earliest earliest)
          if (dateA !== dateB) {
            return dateA - dateB;
          }
          
          // 2. Sort by Priority (HIGH > MEDIUM > LOW)
          const weightA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
          const weightB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
          
          return weightB - weightA;
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching tasks', error);
        this.isLoading = false;
      }
    });
  }

  onAddTask(): void {
    this.router.navigate(['/task/add']);
  }

  onEditTask(id: string | number | undefined): void {
    if (id) {
      this.router.navigate(['/task/edit', id]);
    }
  }

  onCloneTask(task: Task): void {
    this.router.navigate(['/task/add'], { state: { cloneData: task } });
  }

  onDeleteTask(id: string | number | undefined): void {
    if (id && confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== id);
        },
        error: (error) => console.error('Error deleting task', error)
      });
    }
  }

  markComplete(task: Task): void {
    if (task.status === TaskStatus.COMPLETED) return;
    const updatedTask = { ...task, status: TaskStatus.COMPLETED as any };
    this.taskService.updateTask(task.id!, updatedTask).subscribe({
      next: () => {
        task.status = TaskStatus.COMPLETED;
      },
      error: (error) => console.error('Error marking task as complete', error)
    });
  }

  toggleStatus(status: string): void {
    const index = this.selectedStatuses.indexOf(status);
    if (index === -1) {
      this.selectedStatuses.push(status);
    } else {
      this.selectedStatuses.splice(index, 1);
    }
  }

  isStatusSelected(status: string): boolean {
    return this.selectedStatuses.includes(status);
  }

  togglePriority(priority: string): void {
    const index = this.selectedPriorities.indexOf(priority);
    if (index === -1) {
      this.selectedPriorities.push(priority);
    } else {
      this.selectedPriorities.splice(index, 1);
    }
  }

  isPrioritySelected(priority: string): boolean {
    return this.selectedPriorities.includes(priority);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // Only auto-hide on mobile view (width <= 768px)
    if (window.innerWidth <= 768 && this.showFilters && !this.eRef.nativeElement.contains(event.target)) {
      this.showFilters = false;
    }
  }
}
