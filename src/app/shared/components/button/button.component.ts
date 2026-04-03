import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'task-pulse-button, [TaskPulseButton]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() variant: 'primary' | 'secondary' | 'danger' | '' = '';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() buttonType: 'button' | 'submit' = 'button';
  @Input() buttonName: string = '';
  @Input() id: string = '';
  @Input() class: string = '';

  @Output() myClicked = new EventEmitter<void>();

  onClick() {
    if (!this.disabled && !this.loading) {
      this.myClicked.emit();
    }
  }

  get classes() {
    return {
      'btn': true,
      'btn-primary': this.variant === 'primary',
      'btn-secondary': this.variant === 'secondary',
      'btn-danger': this.variant === 'danger',
      'btn-loading': this.loading
    };
  }
}