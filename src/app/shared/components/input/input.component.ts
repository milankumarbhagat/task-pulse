import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, ControlContainer } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {

  @Input() placeholder: string = '';
  @Input() id: string = '';
  @Input() classes: string = '';
  @Input() label: string = '';
  @Input() inputType: 'password' | 'text' | 'email' = 'text';
  @Input() type: string = 'text';
  @Input() controlName!: string; // this is for reactive forms
  @Input() isSubmitted: boolean = false;
  @Input() icon: string = '';

  constructor(public controlContainer: ControlContainer) { }

  get control(): any {
    return this.controlContainer.control?.get(this.controlName); // this is for reactive forms and used to get the control of the input
  }
}
