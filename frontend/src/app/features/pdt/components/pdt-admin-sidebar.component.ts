import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { PdtTab } from '../pdt.models';

@Component({
  selector: 'app-pdt-admin-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pdt-admin-sidebar.component.html',
})
export class PdtAdminSidebarComponent {
  @Input({ required: true }) activeTab!: PdtTab;
  @Output() tabChange = new EventEmitter<PdtTab>();

  readonly icons = APP_ICONS;

  readonly items: Array<{
    key: PdtTab;
    label: string;
    icon: keyof typeof APP_ICONS;
    iconBoxClass: string;
    iconClass: string;
    hoverTextClass: string;
  }> = [
    {
      key: 'time',
      label: 'Cấu hình Thời gian',
      icon: 'clock',
      iconBoxClass: 'bg-blue-100',
      iconClass: 'text-blue-600',
      hoverTextClass: 'group-hover:text-blue-700',
    },
    {
      key: 'topics',
      label: 'Q.Lý Đề tài & GV',
      icon: 'bookOpen',
      iconBoxClass: 'bg-orange-100',
      iconClass: 'text-orange-600',
      hoverTextClass: 'group-hover:text-orange-700',
    },
    {
      key: 'allocation',
      label: 'Phân công Sinh viên',
      icon: 'users',
      iconBoxClass: 'bg-purple-100',
      iconClass: 'text-purple-600',
      hoverTextClass: 'group-hover:text-purple-700',
    },
    {
      key: 'report',
      label: 'Tổng hợp Kết quả',
      icon: 'fileChartColumn',
      iconBoxClass: 'bg-emerald-100',
      iconClass: 'text-emerald-600',
      hoverTextClass: 'group-hover:text-emerald-700',
    },
  ];
}
