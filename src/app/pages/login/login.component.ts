import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { APP_CONSTANTS } from '../../core/constants/app.constants';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  appName = APP_CONSTANTS.APP_NAME;
  loginForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private _notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: (_res) => {
          this.isLoading = false;
          this.router.navigate(['/task']);
          this._notification.success('Login successful!!', 1000);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error(err);
          this._notification.error('Invalid email or password!!');
        }
      });
    }
  }

  loginWithGoogle(): void {
    this._notification.success('Login with Google clicked');
  }
}
