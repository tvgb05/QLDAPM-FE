import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService, Notification } from '../../services/notification.service';
import { APP_ICONS } from '../../icons/app-icons';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div
        *ngFor="let n of notifications$ | async; trackBy: trackById"
        class="pointer-events-auto flex items-center gap-3 min-w-[320px] max-w-md p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-10 fade-in"
        [ngClass]="{
          'bg-white/90 border-emerald-100 text-emerald-900': n.type === 'success',
          'bg-white/90 border-red-100 text-red-900': n.type === 'error',
          'bg-white/90 border-blue-100 text-blue-900': n.type === 'info',
          'bg-white/90 border-amber-100 text-amber-900': n.type === 'warning'
        }"
      >
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          [ngClass]="{
            'bg-emerald-50 text-emerald-600': n.type === 'success',
            'bg-red-50 text-red-600': n.type === 'error',
            'bg-blue-50 text-blue-600': n.type === 'info',
            'bg-amber-50 text-amber-600': n.type === 'warning'
          }"
        >
          <lucide-icon
            [img]="getIcon(n.type)"
            class="w-5 h-5"
          ></lucide-icon>
        </div>
        
        <div class="flex-grow">
          <p class="text-sm font-semibold leading-tight">{{ getTitle(n.type) }}</p>
          <p class="text-sm opacity-80 mt-0.5">{{ n.message }}</p>
        </div>

        <button
          (click)="remove(n.id)"
          class="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors opacity-40 hover:opacity-100"
        >
          <lucide-icon [img]="icons.x" class="w-4 h-4"></lucide-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class NotificationToastComponent {
  private readonly notificationService = inject(NotificationService);
  readonly icons = APP_ICONS;
  notifications$ = this.notificationService.notifications;

  trackById(_index: number, item: Notification): number {
    return item.id;
  }

  getIcon(type: string): any {
    switch (type) {
      case 'success':
        return this.icons['circleCheck'];
      case 'error':
        return this.icons['alertCircle'];
      case 'warning':
        return this.icons['triangleAlert'];
      default:
        return this.icons['info'];
    }
  }

  getTitle(type: string): string {
    switch (type) {
      case 'success':
        return 'Thành công';
      case 'error':
        return 'Lỗi hệ thống';
      case 'warning':
        return 'Cảnh báo';
      default:
        return 'Thông báo';
    }
  }

  remove(id: number): void {
    this.notificationService.remove(id);
  }
}
