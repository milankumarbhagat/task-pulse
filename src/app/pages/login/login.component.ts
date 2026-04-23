import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { APP_CONSTANTS } from '../../core/constants/app.constants';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { NotificationService } from '../../services/notification.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  appName = APP_CONSTANTS.APP_NAME;
  loginForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private _notification: NotificationService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngAfterViewInit(): void {
    this.initializeGoogleLogin();
  }

  private initializeGoogleLogin(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleLogin(response)
      });
      
      google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        { 
          theme: 'outline', 
          size: 'large', 
          width: 320, // Reduced to fit mobile cards
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left'
        }
      );
    }
  }

  private handleGoogleLogin(response: any): void {
    this.ngZone.run(() => {
      this.isLoading = true;
      this.authService.googleLogin(response.credential).subscribe({
        next: (_res) => {
          this.isLoading = false;
          this.router.navigate(['/task']);
          this._notification.success('Login with Google successful!', 1000);
          this._notification.subscribeToNotifications();
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Google login error:', err);
          this._notification.error('Google authentication failed. Please try again.');
        }
      });
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
          this._notification.subscribeToNotifications();
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
    // This is now handled by the official button rendered in #googleBtn
    // but we can still call prompt() for One Tap if we want
    if (typeof google !== 'undefined') {
      google.accounts.id.prompt();
    }
  }
}
