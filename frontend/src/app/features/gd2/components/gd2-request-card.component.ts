import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GroupItem, LecturerCardTone, RequestDecision } from '../gd2.models';

@Component({
  selector: 'app-gd2-request-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gd2-request-card.component.html',
})
export class Gd2RequestCardComponent {
  @Input({ required: true }) group!: GroupItem;
  @Input() readonlyMode = false;
  @Output() approve = new EventEmitter<GroupItem>();
  @Output() reject = new EventEmitter<GroupItem>();

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

  get cardClass(): string {
    return 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group';
  }

  decisionBadgeClass(decision: RequestDecision): string {
    return decision === 'approved'
      ? 'px-4 py-2 text-xs font-bold text-green-600 bg-green-50 rounded-lg border border-green-200 w-full text-center'
      : 'px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg border border-red-200 w-full text-center';
  }

  decisionLabel(decision: RequestDecision): string {
    return decision === 'approved' ? 'Đã tiếp nhận' : 'Đã từ chối';
  }
}
