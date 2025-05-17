import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("Interceptor called for URL:", request.url);
    
    // Don't add token to auth API calls like login, register, refresh-token
    if (request.url.includes('refresh-token') || 
        request.url.includes('login') || 
        request.url.includes('register')) {
      console.log("Skipping token check for auth endpoint");
      return next.handle(request);
    }

    // Check if token is expired before making the request
    const isExpired = this.authService.isTokenExpired();
    console.log("Token expired check:", isExpired);
    
    if (isExpired && !this.isRefreshing) {
      console.log("Token expired, attempting refresh");
      // Token is expired, try to refresh it
      return this.handle401Error(request, next);
    }

    const token = this.authService.getToken();
    console.log("Adding token to request:", token ? "Token exists" : "No token");

    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.log("401 Unauthorized error received");
          // Only try refreshing once and prevent infinite loop
          if (request.url.includes('logout')) {
            // Don't try refreshing on logout - just logout immediately
            this.authService.logout();
            return throwError(() => error);
          }
          
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Check if we have a refresh token
      const refreshToken = this.authService.getRefreshToken();
      if (!refreshToken) {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new Error('No refresh token available'));
      }

      return this.authService.refreshToken().pipe(
        switchMap(tokens => {
          this.refreshTokenSubject.next(tokens);
          return next.handle(this.addToken(request, tokens.token));
        }),
        catchError(error => {
          // If refresh token fails, logout
          this.authService.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // If refresh is in progress, wait until it completes
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token.token));
        })
      );
    }
  }
} 