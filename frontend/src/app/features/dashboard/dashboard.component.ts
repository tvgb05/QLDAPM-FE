import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Type } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { TimeContextService } from '../../shared/services/time-context.service';
import { AuthService } from '../../shared/services/auth.service';
import { ProjectPeriodType } from '../pdt/pdt-time.models';
import { AppRole, NotificationItem } from '../../shared/models/ui.models';

// Import target components
import { MajorSelectionComponent } from '../major-selection/major-selection.component';
import { LecturerSelectionComponent } from '../lecturer-selection/lecturer-selection.component';
import { TopicReviewComponent } from '../topic-review/topic-review.component';
import { ProgressReportComponent } from '../progress-report/progress-report.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AppHeaderComponent, ProjectTimelineComponent],
  template: `
    <div class="bg-slate-50 font-sans text-slate-800 flex flex-col min-h-screen overflow-hidden">
      <app-header
        [notifications]="notifications"
        [showNotifications]="showNotifications"
        (roleChange)="switchRole($event)"
        (toggleNotifications)="toggleNotifications()"
        (clearNotifications)="clearNotifications()"
      />

      <div class="flex flex-1 overflow-hidden">
        <app-project-timeline />

        <main class="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 legacy-scroll">
          <div class="max-w-6xl mx-auto pb-10">
            @if (loading) {
              <div class="flex flex-col items-center justify-center py-20 animate-pulse">
                <div class="w-12 h-12 bg-blue-100 rounded-full mb-4"></div>
                <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang xác định giai đoạn...</p>
              </div>
            } @else {
              <ng-container *ngComponentOutlet="currentComponent; inputs: { hideLayout: true }"></ng-container>
            }
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  showNotifications = false;
  notifications: NotificationItem[] = [];

  loading = true;
  currentComponent: Type<any> | null = null;

  constructor(
    private readonly timeContext: TimeContextService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.timeContext.loading$.subscribe(l => {
      this.loading = l;
      this.cdr.detectChanges();
    });

    this.timeContext.activePeriod$.subscribe(period => {
      console.log('period111', period);
      if (!period) {
        this.currentComponent = null;
      } else {
        switch (period.type) {
          case ProjectPeriodType.MajorSelection:
            this.currentComponent = MajorSelectionComponent;
            break;
          case ProjectPeriodType.LecturerSelection:
            this.currentComponent = LecturerSelectionComponent;
            break;
          case ProjectPeriodType.LecturerReview:
            this.currentComponent = TopicReviewComponent;
            break;
          case ProjectPeriodType.ProjectExecution:
          case ProjectPeriodType.FinalDefense:
            this.currentComponent = ProgressReportComponent;
            break;
          default:
            this.currentComponent = null;
        }
      }
      this.cdr.detectChanges();
    });
  }

  switchRole(role: AppRole): void {
    this.authService.setRole(role);
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }
}
