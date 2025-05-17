import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EventManagementComponent } from './event-management/event-management.component';
import { EventFormComponent } from './event-form/event-form.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'events',
    children: [
      {
        path: 'manage',
        component: EventManagementComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'create',
        component: EventFormComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'edit/:id',
        component: EventFormComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 