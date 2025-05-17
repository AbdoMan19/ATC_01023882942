import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isEditMode = false;
  updateSuccess = false;
  updateError = '';
  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initForm();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name, [Validators.required]],
      email: [this.currentUser?.email, [Validators.required, Validators.email]],
    });

    if (!this.isEditMode) {
      this.profileForm.disable();
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.initForm(); // Reset form to current user data
    }
  }

  submitForm(): void {
    if (this.profileForm.valid && this.currentUser) {
      const updatedUser = {
        ...this.currentUser,
        ...this.profileForm.value
      };

      this.updateSuccess = false;
      this.updateError = '';

      this.authService.updateCurrentUser(updatedUser).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.updateSuccess = true;
          this.isEditMode = false;
          this.profileForm.disable();
        },
        error: (error) => {
          this.updateError = 'Failed to update profile. Please try again.';
          console.error('Profile update error:', error);
        }
      });
    }
  }
} 