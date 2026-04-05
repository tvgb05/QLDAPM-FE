import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../icons/app-icons';
import { AppRole, NotificationItem } from '../../models/ui.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header class="bg-blue-800 text-white border-b border-blue-900/30">
      <div class="px-4 md:px-6 h-20 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
          <div class="w-12 h-12 rounded-xl bg-blue-700 border border-blue-500/40 flex items-center justify-center shrink-0">
            <lucide-icon [img]="icons.graduationCap" class="w-6 h-6"></lucide-icon>
          </div>
          <div class="min-w-0">
            <div class="text-2xl font-black tracking-tight truncate">QUẢN LÝ ĐỒ ÁN</div>
          </div>
        </div>

        <div class="flex items-center gap-3 md:gap-5 shrink-0">
          <div class="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-700/60 border border-blue-500/40 text-sm font-bold">
            <lucide-icon [img]="icons.calendar" class="w-4 h-4"></lucide-icon>
            HK 252
          </div>

          <div class="relative">
            <button
              type="button"
              (click)="toggleNotifications.emit()"
              class="w-10 h-10 rounded-full bg-blue-700/60 border border-blue-500/40 flex items-center justify-center hover:bg-blue-700 transition"
            >
              <lucide-icon [img]="icons.bell" class="w-4 h-4"></lucide-icon>
            </button>

            @if (showNotifications) {
              <div class="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span class="font-bold text-sm">Thông báo</span>
                  <button type="button" (click)="clearNotifications.emit()" class="text-xs text-blue-600 font-bold">
                    Xóa hết
                  </button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  @if (!notifications?.length) {
                    <div class="px-4 py-6 text-sm text-slate-500 text-center">Chưa có thông báo.</div>
                  }
                  @for (item of notifications; track item.message) {
                    <div class="px-4 py-3 text-sm border-b border-slate-50" [innerHTML]="item.message"></div>
                  }
                </div>
              </div>
            }
          </div>

          <div class="text-right hidden sm:block">
            <div class="font-bold leading-tight">{{ userName }}</div>
            <div class="text-[11px] font-bold uppercase inline-block px-2 py-0.5 rounded bg-blue-500/80">{{ userBadge }}</div>
          </div>

          <button
            type="button"
            class="w-10 h-10 rounded-full bg-blue-700/60 border border-blue-500/40 flex items-center justify-center hover:bg-blue-700 transition"
          >
            <lucide-icon [img]="icons.logOut" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class AppHeaderComponent {
  @Input() role: AppRole = 'student';
  @Input() userName = '';
  @Input() userBadge = '';
  @Input() notifications: NotificationItem[] = [];
  @Input() showNotifications = false;
  @Input() showRoleSwitch = false;

  @Output() roleChange = new EventEmitter<AppRole>();
  @Output() toggleNotifications = new EventEmitter<void>();
  @Output() clearNotifications = new EventEmitter<void>();

  readonly icons = APP_ICONS;
}
