import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GroupItem, RequestDecision } from '../lecturer-selection.models';

@Component({
  selector: 'app-lecturer-request-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lecturer-request-card.component.html',
})
export class LecturerRequestCardComponent {
  @Input({ required: true }) group!: GroupItem;
  @Input() processing = false;
  @Input() readonlyMode = false;

  @Output() action = new EventEmitter<'approve' | 'reject'>();

  get cardClass(): string {
    return 'bg-white rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-50/80 group shadow-sm';
  }

  initialsClass(tone: string = 'blue'): string {
    const tones: Record<string, string> = {
      blue: 'w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0',
      purple: 'w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold flex-shrink-0',
      slate: 'w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0',
    };
    return tones[tone] || tones['blue'];
  }

  decisionBadgeClass(decision: RequestDecision): string {
    return {
      none: 'px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold',
      approved: 'px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100',
      rejected: 'px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100',
    }[decision];
  }

  decisionLabel(decision: RequestDecision): string {
    return {
      none: 'Đang chờ',
      approved: 'Đã chấp nhận',
      rejected: 'Đã từ chối',
    }[decision];
  }
}
