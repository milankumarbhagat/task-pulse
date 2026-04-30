import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { InputComponent } from '../../shared/components/input/input.component';
import { APP_CONSTANTS } from '../../core/constants/app.constants';
import { MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';

export const MY_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return new DatePipe('en-US').transform(date, 'EEE, dd MMM yyyy') || '';
    }
    return super.format(date, displayFormat);
  }
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  maxDob: string = '';
  maxDobDate: Date | null = null;
  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Others', value: 'Other' }
  ];
  userPicture: string | undefined;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.calculateMaxDob();
    this.initForm();
    this.loadProfile();
  }

  calculateMaxDob(): void {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
    this.maxDob = maxDate.toISOString().split('T')[0];
    this.maxDobDate = maxDate;
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
        this.userPicture = user.picture;
        const formData = { ...user };
        if (formData.dob) {
          formData.dob = formData.dob.split('T')[0];
          // Disable DOB field if it is already set
          this.profileForm.get('dob')?.disable();
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
