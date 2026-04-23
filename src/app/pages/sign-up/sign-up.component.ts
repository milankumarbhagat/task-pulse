import { Component, OnInit, NgZone } from '@angular/core';
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
import { environment } from '../../../environments/environment';

declare var google: any;

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
  maxDate!: Date;

  occupations: string[] = [
    'Software Engineer', 'Designer', 'Product Manager', 'Student', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.maxDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());

    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      gender: [''],
      dob: ['', [Validators.required, this.ageValidator]],
      phone: ['', Validators.pattern('^[0-9+() -]*$')],
      occupation: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.initializeGoogleLogin();
  }

  private initializeGoogleLogin(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleLogin(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signup-btn'),
        { 
          theme: 'outline', 
          size: 'large', 
          width: 320, 
          text: 'signup_with',
          shape: 'pill',
          logo_alignment: 'left'
        }
      );
    }
  }

  private handleGoogleLogin(response: any): void {
    this.isLoading = true;
    this.authService.googleLogin(response.credential).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.router.navigate(['/task']);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.errorMessage = 'Google Sign up failed. Please try again.';
        });
      }
    });
  }

  ageValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const dob = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age >= 12 ? null : { underAge: true };
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
