import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { APP_ICONS } from '../../icons/app-icons';
import { AppRole, NotificationItem } from '../../models/ui.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  @Input({ required: true }) role!: AppRole;
  @Input({ required: true }) userName!: string;
  @Input({ required: true }) userBadge!: string;
  @Input({ required: true }) notifications!: NotificationItem[];
  @Input({ required: true }) showNotifications!: boolean;
  @Input() showRoleSwitch = true;

  @Output() roleChange = new EventEmitter<AppRole>();
  @Output() toggleNotifications = new EventEmitter<void>();
  @Output() clearNotifications = new EventEmitter<void>();

  readonly icons = APP_ICONS;

  getRoleButtonClass(role: AppRole): string {
    return this.role === role
      ? 'px-4 py-1.5 rounded-md bg-blue-600 font-bold transition shadow-sm hover:shadow-md text-white'
      : 'px-4 py-1.5 rounded-md hover:bg-blue-800 transition text-blue-200';
  }
}
