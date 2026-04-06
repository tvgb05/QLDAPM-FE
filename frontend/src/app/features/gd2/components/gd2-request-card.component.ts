import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { GroupItem } from '../gd2.models';

@Component({
  selector: 'app-gd2-request-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
          {{ group.initials }}
        </div>
        <div>
          <h4 class="font-bold text-slate-800">{{ group.name }}</h4>
          <div class="text-sm text-slate-500">{{ group.studentId }}</div>
          <div class="text-xs text-slate-500 mt-1">{{ group.specialization }}</div>
        </div>
      </div>

      <div class="flex items-center gap-2 justify-end">
        @if (readonlyMode) {
          <span class="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">Đã nhận</span>
        } @else {
          <button type="button" (click)="reject.emit(group)" class="px-3 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-600">
            Từ chối
          </button>
          <button type="button" (click)="approve.emit(group)" class="px-3 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white">
            Duyệt
          </button>
        }
      </div>
    </div>
  `,
})
export class Gd2RequestCardComponent {
  @Input({ required: true }) group!: GroupItem;
  @Input() readonlyMode = false;

  @Output() reject = new EventEmitter<GroupItem>();
  @Output() approve = new EventEmitter<GroupItem>();
}
