import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { LecturerAssignment } from '../gd1.models';

@Component({
  selector: 'app-lecturer-assignment-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './lecturer-assignment-card.component.html',
})
export class LecturerAssignmentCardComponent {
  @Input({ required: true }) assignment!: LecturerAssignment;

  readonly icons = APP_ICONS;

  getIconClass(): string {
    return {
      blue: 'p-3 bg-blue-100 text-blue-600 rounded-lg',
      purple: 'p-3 bg-purple-100 text-purple-600 rounded-lg',
    }[this.assignment.color];
  }
}
