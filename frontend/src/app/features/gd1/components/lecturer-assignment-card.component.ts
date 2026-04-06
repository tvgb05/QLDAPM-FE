import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../../shared/icons/app-icons';
import { LecturerAssignment } from '../gd1.models';

@Component({
  selector: 'app-lecturer-assignment-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <lucide-icon [img]="icons[assignment.icon]" class="w-6 h-6"></lucide-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-800">{{ assignment.name }}</h3>
          <p class="text-sm text-slate-500 mt-2">{{ assignment.faculty }}</p>
        </div>
        <span class="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">{{ assignment.subjectCode }}</span>
      </div>
      <div class="mt-6 text-sm font-medium text-slate-600">{{ assignment.quota }}</div>
    </div>
  `,
})
export class LecturerAssignmentCardComponent {
  @Input({ required: true }) assignment!: LecturerAssignment;

  readonly icons = APP_ICONS;
}
