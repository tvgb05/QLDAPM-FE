import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { Specialization } from '../major-selection.models';

@Component({
  selector: 'app-specialization-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './specialization-card.component.html',
})
export class SpecializationCardComponent {
  @Input({ required: true }) item!: Specialization;
  @Input() selectedSpecializationId: string | null = null;
  @Output() select = new EventEmitter<Specialization>();

  readonly icons = APP_ICONS;

  get isSelected(): boolean {
    return this.selectedSpecializationId === this.item.id;
  }

  getCardClass(): string {
    if (this.isSelected) {
      return 'bg-blue-50 p-6 rounded-2xl border-2 border-blue-500 shadow-md transition group relative overflow-hidden h-full flex flex-col';
    }

    if (this.selectedSpecializationId && this.selectedSpecializationId !== this.item.id) {
      return 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition group relative overflow-hidden h-full flex flex-col opacity-50 grayscale';
    }

    return 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group relative overflow-hidden h-full flex flex-col';
  }

  getButtonClass(): string {
    if (this.isSelected) {
      return 'w-full py-3 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 mt-auto';
    }

    if (this.selectedSpecializationId && this.selectedSpecializationId !== this.item.id) {
      return 'w-full py-3 rounded-xl text-sm font-bold bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100 flex items-center justify-center gap-2 mt-auto';
    }

    return `w-full py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 transition flex items-center justify-center gap-2 mt-auto ${this.getHoverClass(this.item.color)}`;
  }

  getButtonLabel(): string {
    if (this.isSelected) {
      return 'Đã đăng ký';
    }

    if (this.selectedSpecializationId && this.selectedSpecializationId !== this.item.id) {
      return 'Không khả dụng';
    }

    return 'Chọn chuyên ngành đồ án';
  }

  getIconBadgeClass(color: Specialization['color']): string {
    return {
      blue: 'h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4',
      orange:
        'h-12 w-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4',
      green: 'h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4',
      purple:
        'h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4',
    }[color];
  }

  getAccentIconClass(color: Specialization['color']): string {
    return {
      blue: 'w-24 h-24 text-blue-600',
      orange: 'w-24 h-24 text-orange-600',
      green: 'w-24 h-24 text-green-600',
      purple: 'w-24 h-24 text-purple-600',
    }[color];
  }

  private getHoverClass(color: Specialization['color']): string {
    return {
      blue: 'hover:bg-blue-600 hover:text-white',
      orange: 'hover:bg-orange-600 hover:text-white',
      green: 'hover:bg-green-600 hover:text-white',
      purple: 'hover:bg-purple-600 hover:text-white',
    }[color];
  }
}
