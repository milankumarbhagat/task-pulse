import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NotificationService } from '../../services/notification.service';
import { APP_CONSTANTS } from '../../core/constants/app.constants';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  appName = APP_CONSTANTS.APP_NAME;
  resetForm: FormGroup;
  isLoading = false;
  isSubmitted = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private notification: NotificationService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.notification.error('Invalid or missing reset token.');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.resetForm.valid && this.token) {
      this.isLoading = true;
      const data = {
        token: this.token,
        password: this.resetForm.value.password
      };

      this.authService.resetPassword(data).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.notification.success('Password reset successfully! You can now log in.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.notification.error(err.error?.message || 'Failed to reset password. The link may have expired.');
        }
      });
    }
  }
}
