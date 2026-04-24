import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../icons/app-icons';
import { AppRole, NotificationItem } from '../../models/ui.models';
import { AuthService } from '../../services/auth.service';
import { TimeContextService } from '../../services/time-context.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent {
  @Input() role: AppRole = 'student';
  @Input() userName = '';
  @Input() userBadge = '';
  @Input() notifications: NotificationItem[] = [];
  @Input() showNotifications = false;

  @Output() roleChange = new EventEmitter<AppRole>();
  @Output() toggleNotifications = new EventEmitter<void>();
  @Output() clearNotifications = new EventEmitter<void>();

  readonly icons = APP_ICONS;

  constructor(
    public readonly authService: AuthService,
    public readonly timeContext: TimeContextService,
    private readonly router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
