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

import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatInputModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatRadioModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatCardModule,
    ButtonComponent, InputComponent
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent implements OnInit {
  appName = APP_CONSTANTS.APP_NAME;
  signUpForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  occupations: string[] = [
    'Software Engineer', 'Designer', 'Product Manager', 'Student', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

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
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.signUp(this.signUpForm.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error(err);
          this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
        }
      });
    } else {
      this.signUpForm.markAllAsTouched();
    }
  }

  verifyEmail() {
    const invaildEmail = this.signUpForm.get('email')?.hasError('email');
    if (!invaildEmail) {
      // verfiy if the eamil already exists in database
      this.authService.checkEmail(this.signUpForm.get('email')?.value).subscribe({
        next: (res) => {
          if (res) {
            this.signUpForm.get('email')?.setErrors({ emailExists: true });
          }
        },
        error: (err: any) => {
          console.log("\n\n email already error ==> ", err)
          //TODO: show error message in a snackbar
        }
      })
    }
  }

}
