import { Component, OnInit, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DueDateBadgeComponent } from '../../../shared/components/due-date-badge/due-date-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatMenuModule, MatButtonModule, ButtonComponent, DueDateBadgeComponent, ModalComponent],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit, AfterViewInit {
  tasks: Task[] = [];
  isLoading = true;

  searchQuery: string = '';
  selectedStatuses: string[] = []; // Changed to array for multi-select
  selectedPriorities: string[] = []; // Changed to array for multi-select
  selectedDay: string = 'today'; // Default to today for Daily Planner feel
  filterFromDate: string = '';
  filterToDate: string = '';
  showFilters: boolean = false;
  readonly TaskStatus = TaskStatus; // Expose to template
  selectedTaskForDescription: Task | null = null;
  today = new Date();
  @ViewChild('overdueSlider') overdueSlider!: ElementRef;
  canScrollLeft = false;
  canScrollRight = true;

  scrollSlider(direction: number): void {
    if (this.overdueSlider) {
      const scrollAmount = 250;
      this.overdueSlider.nativeElement.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
      });
      // Visibility will be updated via the scroll event listener
    }
  }

  onSliderScroll(): void {
    this.updateArrowVisibility();
  }

  updateArrowVisibility(): void {
    if (this.overdueSlider) {
      const element = this.overdueSlider.nativeElement;
      this.canScrollLeft = element.scrollLeft > 5; // Use 5px buffer
      this.canScrollRight = element.scrollLeft + element.clientWidth < element.scrollWidth - 5;
    }
  }

  ngAfterViewInit() {
    // Initial check after view is initialized
    setTimeout(() => this.updateArrowVisibility(), 500);
  }

  get overdueTasks(): Task[] {
    const todayDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()).getTime();
    return this.tasks.filter(t => {
      if (!t.dueDate || t.status === TaskStatus.COMPLETED) return false;
      const taskDate = new Date(t.dueDate);
      const compareDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).getTime();
      return compareDate < todayDate;
    });
  }

  get todayTasks(): Task[] {
    return this.tasks.filter(t => this.checkDayMatch(t.dueDate, 'today'));
  }

  get inProgressTasks(): Task[] {
    return this.todayTasks.filter(t => t.status === TaskStatus.IN_PROGRESS)
      .sort((a, b) => this.sortByPriority(a, b));
  }

  get todoTasks(): Task[] {
    return this.todayTasks.filter(t => t.status === TaskStatus.TODO)
      .sort((a, b) => this.sortByPriority(a, b));
  }

  get completedTasks(): Task[] {
    return this.todayTasks.filter(t => t.status === TaskStatus.COMPLETED);
  }

  private sortByPriority(a: Task, b: Task): number {
    const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    return (priorityWeight[b.priority as keyof typeof priorityWeight] || 0) - 
           (priorityWeight[a.priority as keyof typeof priorityWeight] || 0);
  }

  get isTodayView(): boolean {
    return this.selectedDay === 'today';
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.selectedDay !== 'today') count++;
    if (this.filterFromDate) count++;
    if (this.filterToDate) count++;
    count += this.selectedStatuses.length;
    count += this.selectedPriorities.length;
    return count;
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  get isDashboardView(): boolean {
    return !this.searchQuery && this.selectedDay === 'today' && !this.filterFromDate && !this.filterToDate && this.selectedStatuses.length === 0 && this.selectedPriorities.length === 0;
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const matchSearch = task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const isDateRangeSelected = !!(this.filterFromDate || this.filterToDate);
      const isFiltering = this.searchQuery || isDateRangeSelected || this.selectedStatuses.length > 0 || this.selectedPriorities.length > 0 || this.selectedDay !== 'today';

      const matchStatus = this.selectedStatuses.length > 0 
        ? this.selectedStatuses.includes(task.status) 
        : (isFiltering ? true : task.status !== TaskStatus.COMPLETED);

      const matchPriority = this.selectedPriorities.length > 0 
        ? this.selectedPriorities.includes(task.priority) 
        : true;

      const matchDay = (this.searchQuery || isDateRangeSelected || this.selectedDay === 'all') 
        ? true 
        : this.checkDayMatch(task.dueDate, this.selectedDay);

      let matchCustomDate = true;
      if (task.dueDate && isDateRangeSelected) {
        const taskDate = new Date(task.dueDate);
        const compareTaskDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate()).getTime();

        if (this.filterFromDate) {
          const [y, m, d] = this.filterFromDate.split('-');
          const compareFrom = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
          if (compareTaskDate < compareFrom) matchCustomDate = false;
        }

        if (matchCustomDate && this.filterToDate) {
          const [y, m, d] = this.filterToDate.split('-');
          const compareTo = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
          if (compareTaskDate > compareTo) matchCustomDate = false;
        }
      } else if (!task.dueDate && isDateRangeSelected) {
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
    this.saveFilters();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  constructor(
    private taskService: TaskService, 
    public router: Router, 
    private eRef: ElementRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadTasks();
  }

  private saveFilters(): void {
    const filterState = {
      searchQuery: this.searchQuery,
      selectedStatuses: this.selectedStatuses,
      selectedPriorities: this.selectedPriorities,
      selectedDay: this.selectedDay,
      filterFromDate: this.filterFromDate,
      filterToDate: this.filterToDate
    };
    localStorage.setItem('task_filters', JSON.stringify(filterState));
  }

  private loadFilters(): void {
    const saved = localStorage.getItem('task_filters');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.searchQuery = state.searchQuery || '';
        this.selectedStatuses = state.selectedStatuses || [];
        this.selectedPriorities = state.selectedPriorities || [];
        this.selectedDay = state.selectedDay || 'today';
        this.filterFromDate = state.filterFromDate || '';
        this.filterToDate = state.filterToDate || '';
      } catch (e) {
        console.error('Error parsing saved filters', e);
      }
    }
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

  viewDescription(task: Task): void {
    this.selectedTaskForDescription = task;
  }

  closeDescription(): void {
    this.selectedTaskForDescription = null;
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

  toggleStatusFilter(status: string): void {
    const index = this.selectedStatuses.indexOf(status);
    if (index === -1) {
      this.selectedStatuses.push(status);
    } else {
      this.selectedStatuses.splice(index, 1);
    }
    this.saveFilters();
  }

  togglePriorityFilter(priority: string): void {
    const index = this.selectedPriorities.indexOf(priority);
    if (index === -1) {
      this.selectedPriorities.push(priority);
    } else {
      this.selectedPriorities.splice(index, 1);
    }
    this.saveFilters();
  }

  setSelectedDay(day: string): void {
    this.selectedDay = day;
    this.saveFilters();
  }

  onSearchChange(): void {
    this.saveFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatuses = [];
    this.selectedPriorities = [];
    this.filterFromDate = '';
    this.filterToDate = '';
    this.selectedDay = 'today';
    this.saveFilters();
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
