import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    const requiredRole = route.data['role'] as UserRole;
    
    if (!currentUser) {
      this.authService.setRedirectUrl(state.url);
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (currentUser.role === requiredRole) {
      return true;
    }

    // Redirect based on role
    if (currentUser.role === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/events']);
    }
    return false;
  }
} 