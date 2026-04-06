import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../../shared/icons/app-icons';
import { RegistrationItem } from '../gd2.models';

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
    return 'bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm';
  }

  initialsClass(tone: RegistrationItem['tone']): string {
    return {
      blue: 'w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold',
      purple: 'w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold',
      slate: 'w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold',
    }[tone];
  }

  tagClass(tone: RegistrationItem['tone']): string {
    return {
      blue: 'px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700',
      purple: 'px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700',
      slate: 'px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700',
    }[tone];
  }

  lecturerNameClass(): string {
    return this.item.registered ? 'text-blue-700' : '';
  }

  quotaValueClass(): string {
    return this.item.full ? 'text-red-600' : 'text-slate-600';
  }
}
