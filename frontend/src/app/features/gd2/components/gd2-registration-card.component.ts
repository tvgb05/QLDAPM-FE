import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { LecturerCardTone, RegistrationItem } from '../gd2.models';

@Component({
  selector: 'app-gd2-registration-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './gd2-registration-card.component.html',
})
export class Gd2RegistrationCardComponent {
  @Input({ required: true }) item!: RegistrationItem;
  @Output() registerToggle = new EventEmitter<RegistrationItem>();

  readonly icons = APP_ICONS;

  get cardClass(): string {
    if (this.item.full) {
      return 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm opacity-70 flex flex-col md:flex-row items-center justify-between gap-4';
    }

    if (this.item.tone === 'blue') {
      return 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col md:flex-row items-center justify-between gap-4 group';
    }

    return 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition flex flex-col md:flex-row items-center justify-between gap-4 group';
  }

  initialsClass(tone: LecturerCardTone): string {
    switch (tone) {
      case 'blue':
        return 'h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg border border-blue-200';
      case 'purple':
        return 'h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-lg border border-purple-100';
      default:
        return 'h-12 w-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold text-lg border border-slate-200';
    }
  }

  tagClass(tone: LecturerCardTone): string {
    switch (tone) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 border border-blue-100 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border border-purple-100 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded';
    }
  }

  quotaValueClass(): string {
    if (this.item.progress >= 100) {
      return 'text-red-600';
    }
    if (this.item.progress >= 60) {
      return 'text-yellow-600';
    }
    return 'text-blue-600';
  }

  lecturerNameClass(): string {
    if (this.item.tone === 'blue') {
      return 'group-hover:text-blue-600';
    }
    if (this.item.tone === 'purple') {
      return 'group-hover:text-purple-600';
    }
    return '';
  }
}
