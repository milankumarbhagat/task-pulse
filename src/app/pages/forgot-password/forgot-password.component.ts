import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NotificationService } from '../../services/notification.service';
import { APP_CONSTANTS } from '../../core/constants/app.constants';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputComponent, ButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  appName = APP_CONSTANTS.APP_NAME;
  forgotForm: FormGroup;
  isLoading = false;
  isSubmitted = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NotificationService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.emailSent = true;
          this.notification.success('Reset link sent to your email!');
        },
        error: (err) => {
          this.isLoading = false;
          this.notification.error('Failed to send reset link. Please try again.');
        }
      });
    }
  }
}
