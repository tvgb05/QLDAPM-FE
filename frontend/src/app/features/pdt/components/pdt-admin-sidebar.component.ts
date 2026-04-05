import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../../shared/icons/app-icons';
import { PdtTab } from '../pdt.models';

@Component({
  selector: 'app-pdt-admin-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <aside class="w-72 bg-white border-r border-slate-200 hidden md:block">
      <div class="px-6 py-8 border-b border-slate-100">
        <h2 class="text-2xl font-black text-slate-800">Quản trị hệ thống</h2>
      </div>

      <div class="p-5 space-y-4">
        @for (item of items; track item.id) {
          <button
            type="button"
            (click)="tabChange.emit(item.id)"
            class="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition"
            [class]="activeTab === item.id ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-transparent bg-white hover:bg-slate-50 text-slate-700'"
          >
            <div class="w-11 h-11 rounded-xl flex items-center justify-center"
              [class]="activeTab === item.id ? 'bg-blue-100 text-blue-700' : item.iconClass">
              <lucide-icon [img]="icons[item.icon]" class="w-5 h-5"></lucide-icon>
            </div>
            <span class="font-bold text-lg">{{ item.label }}</span>
          </button>
        }
      </div>
    </aside>
  `,
})
export class PdtAdminSidebarComponent {
  @Input({ required: true }) activeTab!: PdtTab;
  @Output() tabChange = new EventEmitter<PdtTab>();

  readonly icons = APP_ICONS;
  readonly items: { id: PdtTab; label: string; icon: keyof typeof APP_ICONS; iconClass: string }[] = [
    { id: 'time', label: 'Cấu hình Thời gian', icon: 'clock3', iconClass: 'bg-blue-100 text-blue-700' },
    { id: 'topics', label: 'Q.Lý Đề tài & GV', icon: 'plus', iconClass: 'bg-orange-100 text-orange-700' },
    { id: 'allocation', label: 'Phân công Sinh viên', icon: 'users', iconClass: 'bg-purple-100 text-purple-700' },
    { id: 'report', label: 'Tổng hợp Kết quả', icon: 'building2', iconClass: 'bg-green-100 text-green-700' },
  ];
}
