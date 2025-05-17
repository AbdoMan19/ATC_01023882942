import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
  animations: [
    trigger('toastAnimation', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition(':enter', [
        animate('300ms ease-out')
      ]),
      transition(':leave', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class NotificationToastComponent {
  @Input() message: string = '';
  @Input() type: ToastType = 'info';
  @Input() duration: number = 3000;
  @Input() showClose: boolean = true;

  getIcon(): string {
    switch (this.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      default:
        return 'fas fa-info-circle';
    }
  }
} 