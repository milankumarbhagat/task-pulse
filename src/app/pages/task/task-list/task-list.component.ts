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
  selectedDay: string = 'all'; // 'all', 'yesterday', 'today', 'tomorrow'
  filterFromDate: string = '';
  filterToDate: string = '';
  showFilters: boolean = false;
  readonly TaskStatus = TaskStatus; // Expose to template

  get activeFiltersCount(): number {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.selectedDay !== 'all') count++;
    if (this.filterFromDate) count++;
    if (this.filterToDate) count++;
    count += this.selectedStatuses.length;
    count += this.selectedPriorities.length;
    return count;
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      // If no statuses selected, hide COMPLETED by default, UNLESS a date range filter is active
      const isDateRangeSelected = !!(this.filterFromDate || this.filterToDate);
      const matchStatus = this.selectedStatuses.length > 0 
        ? this.selectedStatuses.includes(task.status) 
        : (isDateRangeSelected ? true : task.status !== TaskStatus.COMPLETED);

      const matchPriority = this.selectedPriorities.length > 0 
        ? this.selectedPriorities.includes(task.priority) 
        : true;

      const matchDay = this.checkDayMatch(task.dueDate, this.selectedDay);

      let matchCustomDate = true;
      if (task.dueDate && (this.filterFromDate || this.filterToDate)) {
        const taskDate = new Date(task.dueDate);
        const compareTaskDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).getTime();

        if (this.filterFromDate) {
          const [y, m, d] = this.filterFromDate.split('-');
          const compareFrom = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
          if (compareTaskDate < compareFrom) {
            matchCustomDate = false;
          }
        }

        if (matchCustomDate && this.filterToDate) {
          const [y, m, d] = this.filterToDate.split('-');
          const compareTo = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
          if (compareTaskDate > compareTo) {
            matchCustomDate = false;
          }
        }
      } else if (!task.dueDate && (this.filterFromDate || this.filterToDate)) {
        matchCustomDate = false;
      }

      return matchSearch && matchStatus && matchPriority && matchDay && matchCustomDate;
    });
  }

  private checkDayMatch(dueDate: any, filter: string): boolean {
    if (filter === 'all' || !dueDate) return filter === 'all';

    const taskDate = new Date(dueDate);
    const today = new Date();
    
    // Reset time for comparison
    const compareDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).getTime();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    const oneDay = 24 * 60 * 60 * 1000;

    switch (filter) {
      case 'yesterday':
        return compareDate === todayDate - oneDay;
      case 'today':
        return compareDate === todayDate;
      case 'tomorrow':
        return compareDate === todayDate + oneDay;
      default:
        return true;
    }
  }

  onDateRangeChange(): void {
    if (this.filterFromDate && this.filterToDate) {
      const [fy, fm, fd] = this.filterFromDate.split('-');
      const from = new Date(Number(fy), Number(fm) - 1, Number(fd));
      
      const [ty, tm, td] = this.filterToDate.split('-');
      const to = new Date(Number(ty), Number(tm) - 1, Number(td));

      if (from > to) {
        from.setDate(from.getDate() + 1);
        const ny = from.getFullYear();
        const nm = String(from.getMonth() + 1).padStart(2, '0');
        const nd = String(from.getDate()).padStart(2, '0');
        this.filterToDate = `${ny}-${nm}-${nd}`;
      }
    }
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
