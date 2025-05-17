import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EventManagementComponent } from './event-management/event-management.component';
import { EventFormComponent } from './event-form/event-form.component';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog/delete-confirmation-dialog.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule,
    SharedModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AdminDashboardComponent,
    EventManagementComponent,
    EventFormComponent,
    DeleteConfirmationDialogComponent
  ]
})
export class AdminModule { } 