import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, ControlContainer } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IonInput, IonLabel, IonItem, IonSelect, IonSelectOption, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, IonInput, IonLabel, IonItem, IonSelect, IonSelectOption, IonButton],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {

  @Input() placeholder: string = '';
  @Input() id: string = '';
  @Input() classes: string = '';
  @Input() label: string = '';
  @Input() inputType: string = 'text';
  @Input() controlName!: string; // this is for reactive forms
  @Input() isSubmitted: boolean = false;
  @Input() icon: string = '';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() max: string = '';
  @Input() maxDate: Date | null = null;
  @Input() options: { label: string, value: any }[] = [];
  @Input() maxlength: number | null = null;
  @Input() autocomplete: string = 'on';

  @Output() blurEvent = new EventEmitter<void>();

  hidePassword = true;

  constructor(public controlContainer: ControlContainer) { }

  get control(): any {
    return this.controlContainer.control?.get(this.controlName); // this is for reactive forms and used to get the control of the input
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  handleBlurEvent(event: Event) {
    this.blurEvent.emit();
  }
}
