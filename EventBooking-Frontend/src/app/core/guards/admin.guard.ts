import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.role === UserRole.ADMIN) {
      return true;
    }

    // Store the attempted URL for redirecting after login
    this.authService.setRedirectUrl(state.url);
    
    // Navigate to login page
    this.router.navigate(['/auth/login']);
    return false;
  }
} 