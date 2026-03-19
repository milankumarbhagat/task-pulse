import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { APP_CONSTANTS } from '../../core/constants/app.constants';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatInputModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatRadioModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatCardModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  appName = APP_CONSTANTS.APP_NAME;
  signUpForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  
  occupations: string[] = [
    'Software Engineer', 'Designer', 'Product Manager', 'Student', 'Other'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      gender: [''],
      dob: [''],
      phone: ['', Validators.pattern('^[0-9+() -]*$')],
      occupation: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    // If we only set errors on the child, make sure to clean them up properly when valid
    if (confirmPassword?.hasError('passwordMismatch')) {
      // Create a new error object without passwordMismatch
      const newErrors = { ...confirmPassword.errors };
      delete newErrors['passwordMismatch'];
      // If it's the only error, set it to null
      confirmPassword.setErrors(Object.keys(newErrors).length ? newErrors : null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      console.log('Registration Data:', this.signUpForm.value);
    } else {
      this.signUpForm.markAllAsTouched();
    }
  }
}
