import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, finalize, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';
import { AuthResponse, TokenResponse } from '../models/auth-response.interface';
import { LoginRequest } from '../models/login-request.interface';
import { RegisterRequest } from '../models/register-request.interface';
import { RefreshTokenRequest } from '../models/refresh-token-request.interface';
import { ApiResponse, ValidationError } from '../models/api-response.interface';

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);
  private redirectUrl: string | null = null;
  public currentUser$ = this.currentUserSubject.asObservable();
  private deviceInfo: { deviceId: string; deviceName: string; deviceType: string; platform: string };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for stored token and user data
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      this.currentUserSubject.next(JSON.parse(userData));
    }
    
    // Initialize device info on service creation
    this.deviceInfo = this.getDeviceInfo();
    // Store device ID in localStorage for persistence across sessions
    if (!localStorage.getItem('deviceId')) {
      localStorage.setItem('deviceId', this.deviceInfo.deviceId);
    } else {
      this.deviceInfo.deviceId = localStorage.getItem('deviceId') || this.deviceInfo.deviceId;
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    const url = this.redirectUrl;
    this.redirectUrl = null;
    return url;
  }

  private getDeviceInfo(): { deviceId: string; deviceName: string; deviceType: string; platform: string } {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Generate a unique device ID based on browser info
    const deviceId = localStorage.getItem('deviceId') || 
      btoa(`${userAgent}-${platform}-${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '');
    
    // Get device name (browser name)
    const deviceName = navigator.appName || 'Unknown Browser';
    
    // Determine device type
    const deviceType = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'Mobile' : 'Desktop';
    
    return {
      deviceId,
      deviceName,
      deviceType,
      platform
    };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private handleApiError(errorList: ValidationError[]): never {
    // Group errors by property name
    const groupedErrors = errorList.reduce((acc, error) => {
      if (!acc[error.propertyName]) {
        acc[error.propertyName] = [];
      }
      acc[error.propertyName].push(error.message);
      return acc;
    }, {} as Record<string, string[]>);

    // Create a formatted error message
    const errorMessage = Object.entries(groupedErrors)
      .map(([property, messages]) => `${property}: ${messages.join(', ')}`)
      .join('\n');

    throw new Error(errorMessage);
  }

  login(email: string, password: string): Observable<User> {
    if (environment.mockApi) {
      // Mock successful login
      const mockUser: User = {
        id: '1',
        email,
        name: 'Test User',
        role: UserRole.ADMIN,
        createdAt: new Date()
      };
      // Set expiration time 1 hour from now
      const expiresAt = new Date(Date.now() + 3600 * 1000);
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('tokenExpires', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(mockUser));
      this.currentUserSubject.next(mockUser);
      this.getCurrentUser();
      return of(mockUser);
    }

    const loginRequest: LoginRequest = {
      email,
      password,
      ...this.deviceInfo
    };

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        map(response => {
          if (response.errorList && response.errorList.length > 0) {
            this.handleApiError(response.errorList);
          }
          console.log(response)
          return response.data;
        }),
    
        tap(response => {
          localStorage.setItem('accessToken', response.tokens.token);
          localStorage.setItem('refreshToken', response.tokens.refreshToken);
          localStorage.setItem('tokenExpires', response.tokens.expiresAt.toString());
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        map(response => response.user)
      );
  }

  register(email: string, password: string, name: string): Observable<User> {
    if (environment.mockApi) {
      // Mock successful registration
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role: UserRole.USER,
        createdAt: new Date()
      };
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      this.currentUserSubject.next(mockUser);
      this.router.navigate(['/events']);
      return of(mockUser);
    }

    const registerRequest: RegisterRequest = {
      name,
      email,
      password,
      confirmPassword: password,
      ...this.deviceInfo
    };

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        map(response => {
          if (response.errorList && response.errorList.length > 0) {
            this.handleApiError(response.errorList);
          }
          return response.data;
        }),
        tap(response => {
          localStorage.setItem('accessToken', response.tokens.token);
          localStorage.setItem('refreshToken', response.tokens.refreshToken);
          localStorage.setItem('tokenExpires', response.tokens.expiresAt.toString());
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.router.navigate(['/events']);
        }),
        map(response => response.user)
      );
  }

  logout(): Observable<boolean> {
    if (environment.mockApi) {
      console.log("Mock logout: Clearing user data");
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpires');
      localStorage.removeItem('user');
      this.currentUserSubject.next(null);
      this.router.navigate(['/auth/login']);
      return of(true);
    }

    const headers = this.getAuthHeaders();
    console.log("Real logout: Sending logout request to API");
    
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        map(response => {
          if (response.errorList && response.errorList.length > 0) {
            this.handleApiError(response.errorList);
          }
          return response.data;
        }),
        tap(() => {
          console.log("Logout successful: Clearing user data");
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenExpires');
          localStorage.removeItem('user');
          this.currentUserSubject.next(null);
          this.router.navigate(['/auth/login']);
        }),
        catchError(error => {
          // Even if API request fails, we should clear local data
          console.error('Logout API error:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenExpires');
          localStorage.removeItem('user');
          this.currentUserSubject.next(null);
          this.router.navigate(['/auth/login']);
          return of(false);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isTokenExpired(): boolean {
    const expiresStr = localStorage.getItem('tokenExpires');
    if (!expiresStr) {
      console.log("Token expiration not found in localStorage");
      return true;
    }
    
    const expires = new Date(expiresStr);
    const isExpired = expires <= new Date();
    return isExpired;
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    const notExpired = !this.isTokenExpired();
    return hasToken && notExpired;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMIN;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshToken(): Observable<TokenResponse> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return of(token);
          } else {
            return throwError(() => new Error('Refresh token failed'));
          }
        })
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.refreshTokenInProgress = false;
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = {
      refreshToken
    };

    if (environment.mockApi) {
      // Mock successful token refresh
      const mockTokens: TokenResponse = {
        token: 'new-mock-token',
        refreshToken: 'new-mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour from now
      };
      
      localStorage.setItem('accessToken', mockTokens.token);
      localStorage.setItem('refreshToken', mockTokens.refreshToken);
      localStorage.setItem('tokenExpires', mockTokens.expiresAt.toString());
      
      this.refreshTokenInProgress = false;
      this.refreshTokenSubject.next(mockTokens);
      return of(mockTokens);
    }

    return this.http.post<ApiResponse<TokenResponse>>(`${this.apiUrl}/refresh-token`, request)
      .pipe(
        map(response => {
          if (response.errorList && response.errorList.length > 0) {
            this.handleApiError(response.errorList);
          }
          return response.data;
        }),
        tap(tokens => {
          localStorage.setItem('accessToken', tokens.token);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.setItem('tokenExpires', tokens.expiresAt.toString());
        }),
        catchError(error => {
          // If refresh token fails, logout the user
          this.logout();
          return throwError(() => new Error('Failed to refresh token'));
        }),
        finalize(() => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(true);
        })
      );
  }

  updateCurrentUser(updatedUser: User): Observable<User> {
    if (environment.mockApi) {
      // Mock successful update
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      return of(updatedUser);
    }
    
    const headers = this.getAuthHeaders();
    
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${updatedUser.id}`, updatedUser, { headers })
      .pipe(
        map(response => {
          if (response.errorList && response.errorList.length > 0) {
            this.handleApiError(response.errorList);
          }
          return response.data;
        }),
        tap(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    const request: ChangePasswordRequest = {
      oldPassword,
      newPassword,
      confirmPassword
    };

    if(environment.mockApi) {
      //simulate the logic of the backend
      const oldPassword = '123456';
      if(oldPassword !== oldPassword) {
        return throwError(() => new Error('Invalid old password'));
      }
      if(newPassword !== confirmPassword) {
        return throwError(() => new Error('New password and confirm password do not match'));
      }
      return of({ success: true });
    }
    
    const headers = this.getAuthHeaders();
    
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/change-password`, request, { headers })
      .pipe(
        map(response => {
          if (response.errorList && response.errorList.length > 0) {
            this.handleApiError(response.errorList);
          }
          return response.data;
        })
      );
  }
} 