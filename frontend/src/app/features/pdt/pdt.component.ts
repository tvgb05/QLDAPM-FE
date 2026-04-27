import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { AppRole, NotificationItem } from '../../shared/models/ui.models';
import { PdtAdminSidebarComponent } from './components/pdt-admin-sidebar.component';
import { PdtTab } from './pdt.models';
import { PdtTimeTabComponent } from './components/pdt-time-tab.component';
import { PdtTopicsTabComponent } from './components/pdt-topics-tab.component';
import { PdtAllocationTabComponent } from './components/pdt-allocation-tab.component';
import { PdtReportTabComponent } from './components/pdt-report-tab.component';
import { MajorRegistrationsListComponent } from '../major-selection/components/major-registrations-list.component';

@Component({
  selector: 'app-pdt',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AppHeaderComponent,
    PdtAdminSidebarComponent,
    PdtTimeTabComponent,
    PdtTopicsTabComponent,
    PdtAllocationTabComponent,
    PdtReportTabComponent,
    MajorRegistrationsListComponent,
  ],
  templateUrl: './pdt.component.html',
})
export class PdtComponent {
  readonly icons = APP_ICONS;
  role: AppRole = 'student';
  userName = 'Nguyễn Văn A';
  userBadge = 'PDT';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  activeTab: PdtTab = 'time';

  switchRole(role: AppRole): void {
    this.role = role;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  switchAdminTab(tabName: PdtTab): void {
    this.activeTab = tabName;
  }

  addNotification(notification: NotificationItem): void {
    this.notifications.unshift(notification);
  }
}
