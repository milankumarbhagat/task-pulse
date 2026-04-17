import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { APP_CONSTANTS } from '../../core/constants/app.constants';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      gender: [''],
      dob: [''],
      phone: ['', [
        Validators.required,
        Validators.pattern(APP_CONSTANTS.MOBILE_NUMBER_PATTERN)
      ]],
      occupation: ['']
    });
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        const formData = { ...user };
        if (formData.dob) {
          formData.dob = formData.dob.split('T')[0];
        }
        this.profileForm.patchValue(formData);
      },
      error: () => {
        this.notificationService.error('Failed to load profile details');
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.notificationService.warning('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    const { email, ...updateData } = this.profileForm.getRawValue();

    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob).toISOString();
    } else {
      delete updateData.dob; // don't send empty string to a date field
    }

    this.userService.updateProfile(updateData).subscribe({
      next: () => {
        this.notificationService.success('Profile updated successfully');
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.error('Failed to update profile');
        this.isLoading = false;
      }
    });
  }
}
