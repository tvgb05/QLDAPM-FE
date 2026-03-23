import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { APP_ICONS } from '../../icons/app-icons';
import { TimelineStep } from '../../models/ui.models';

@Component({
  selector: 'app-project-timeline',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './project-timeline.component.html',
})
export class ProjectTimelineComponent {
  @Input({ required: true }) timeline!: TimelineStep[];

  readonly icons = APP_ICONS;
}
