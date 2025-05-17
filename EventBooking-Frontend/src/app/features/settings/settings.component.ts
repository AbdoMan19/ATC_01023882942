import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';

interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  passwordForm!: FormGroup;
  languagePreference: string = 'en';
  updateSuccess = false;
  updateError = '';
  passwordUpdateSuccess = false;
  passwordUpdateError = '';
  currentUser: User | null = null;
  UserRole = UserRole;
  
  languages: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }
  ];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initPasswordForm();
    this.languagePreference = localStorage.getItem('appLanguage') || 'en';
  }

  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).*$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  getPasswordErrorMessage(controlName: string): string {
    const control = this.passwordForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    if (controlName === 'newPassword' && control.hasError('pattern')) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (controlName === 'confirmPassword' && this.passwordForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  isPasswordFormValid(): boolean {
    if (!this.passwordForm.valid) return false;
    
    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
    return oldPassword && newPassword && confirmPassword && newPassword === confirmPassword;
  }

  changePassword(): void {
    if (this.isPasswordFormValid()) {
      const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
      
      this.passwordUpdateSuccess = false;
      this.passwordUpdateError = '';
      
      this.authService.changePassword(oldPassword, newPassword, confirmPassword).subscribe({
        next: () => {
          this.passwordUpdateSuccess = true;
          this.passwordForm.reset();
        },
        error: (error) => {
          this.passwordUpdateError = error.message || 'Failed to change password. Please try again.';
          console.error('Password change error:', error);
        }
      });
    }
  }

  changeLanguage(languageCode: string): void {
    this.updateSuccess = false;
    this.updateError = '';
    
    try {
      localStorage.setItem('appLanguage', languageCode);
      this.languagePreference = languageCode;
      this.updateSuccess = true;
    } catch (error) {
      this.updateError = 'Failed to change language preference.';
      console.error('Language change error:', error);
    }
  }
} 