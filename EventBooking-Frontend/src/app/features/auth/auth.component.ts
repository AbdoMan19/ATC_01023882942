import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isLoginMode = true;
  authForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.authForm = this.formBuilder.group({
      name: ['', this.isLoginMode ? [] : [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isLoginMode
        ? [Validators.required]
        : [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/[A-Z]/), // uppercase
            Validators.pattern(/[a-z]/), // lowercase
            Validators.pattern(/[0-9]/), // number
            Validators.pattern(/[^a-zA-Z0-9]/) // special character
          ]
      ],
      confirmPassword: ['', this.isLoginMode ? [] : [Validators.required]]
    }, { validator: this.isLoginMode ? null : this.passwordMatchValidator });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
    this.initializeForm();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getErrorMessage(controlName: string): string {
    const control = this.authForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (controlName === 'email' && control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (controlName === 'name') {
      if (control?.hasError('minlength')) {
        return 'Name must be at least 2 characters';
      }
      if (control?.hasError('maxlength')) {
        return 'Name cannot exceed 50 characters';
      }
    }
    if (controlName === 'password') {
      const value = control?.value || '';
      if (control?.hasError('required')) {
        return 'This field is required';
      }
      if (!this.isLoginMode) {
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(value)) {
          return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(value)) {
          return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(value)) {
          return 'Password must contain at least one number';
        }
        if (!/[^a-zA-Z0-9]/.test(value)) {
          return 'Password must contain at least one special character';
        }
      }
    }
    if (controlName === 'confirmPassword' && control?.hasError('mismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  onSubmit() {
    if (this.authForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.loading = true;
    this.error = null;

    const { name, email, password } = this.authForm.value;

    if (this.isLoginMode) {
      this.authService.login(email, password).subscribe({
        next: (user) => {
          console.log(user);
          const redirectUrl = this.authService.getRedirectUrl();
          console.log(redirectUrl);
          if (redirectUrl) {
            this.router.navigate([redirectUrl]);
          } else {
            this.redirectBasedOnRole(user.role);
          }
        },
        error: (error) => {
          console.log(error);
          this.error = error.message || 'An error occurred during login';
          this.loading = false;
        }
      });
    } else {
      this.authService.register(email, password, name).subscribe({
        next: (user) => {
          this.redirectBasedOnRole(user.role);
        },
        error: (error) => {
          this.error = error.message || 'An error occurred during registration';
          this.loading = false;
        }
      });
    }
  }

  private redirectBasedOnRole(role: UserRole) {
    if (role === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/events']);
    }
  }
} 