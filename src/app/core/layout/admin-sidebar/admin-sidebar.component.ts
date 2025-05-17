import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  menuItems = [
    {
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/admin/dashboard'
    },
    {
      title: 'Events',
      icon: 'fas fa-calendar-alt',
      route: '/admin/events'
    },
    {
      title: 'Bookings',
      icon: 'fas fa-ticket-alt',
      route: '/admin/bookings'
    },
    {
      title: 'Users',
      icon: 'fas fa-users',
      route: '/admin/users'
    },
    {
      title: 'Settings',
      icon: 'fas fa-cog',
      route: '/admin/settings'
    }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }
} 