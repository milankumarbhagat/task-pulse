import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
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
  selectedStatus: string = '';
  selectedPriority: string = '';

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchStatus = this.selectedStatus ? task.status === this.selectedStatus : true;
      const matchPriority = this.selectedPriority ? task.priority === this.selectedPriority : true;
      return matchSearch && matchStatus && matchPriority;
    });
  }

  constructor(private taskService: TaskService, private router: Router) {}

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
    if (task.status === 'COMPLETED') return;
    const updatedTask = { ...task, status: 'COMPLETED' as any };
    this.taskService.updateTask(task.id!, updatedTask).subscribe({
      next: () => {
        task.status = 'COMPLETED';
      },
      error: (error) => console.error('Error marking task as complete', error)
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }
}
