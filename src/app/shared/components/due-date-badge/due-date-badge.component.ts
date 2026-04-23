import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-due-date-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './due-date-badge.component.html',
  styleUrl: './due-date-badge.component.css'
})
export class DueDateBadgeComponent implements OnInit, OnChanges {
  @Input() dueDate!: string;
  status: 'overdue' | 'due-today' | 'due-soon' | 'on-track' = 'on-track';
  displayText: string = '';

  ngOnInit() {
    this.calculateStatus();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dueDate']) {
      this.calculateStatus();
    }
  }

  private calculateStatus() {
    if (!this.dueDate) {
      this.displayText = 'No date';
      this.status = 'on-track';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(this.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      this.status = 'overdue';
      this.displayText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      this.status = 'due-today';
      this.displayText = 'Due Today';
    } else if (diffDays <= 3) {
      this.status = 'due-soon';
      this.displayText = `Due in ${diffDays} days`;
    } else {
      this.status = 'on-track';
      this.displayText = 'On Track';
    }
  }
}
