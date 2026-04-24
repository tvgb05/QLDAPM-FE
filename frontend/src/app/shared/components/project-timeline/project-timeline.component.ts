import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { APP_ICONS } from '../../icons/app-icons';
import { TimelineChild, TimelineStep } from '../../models/ui.models';
import { TimeContextService } from '../../services/time-context.service';
import { ProjectPeriodResponse, ProjectPeriodType } from '../../../features/pdt/pdt-time.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-timeline',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './project-timeline.component.html',
})
export class ProjectTimelineComponent {
  @Input() timeline: TimelineStep[] | null = null;

  readonly icons = APP_ICONS;
  currentSemesterName = 'Đang tải...';

  dynamicTimeline: TimelineStep[] = [];
  majors: any[] = [];
  activePeriodType: ProjectPeriodType | null = null;

  constructor(
    private readonly router: Router,
    private readonly timeContext: TimeContextService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.timeContext.allPeriodsInSemester$.subscribe(periods => {
      if (periods.length > 0) {
        this.buildDynamicTimeline(periods);
        this.cdr.detectChanges();
      }
    });

    this.timeContext.activeSemester$.subscribe(s => {
      if (s) {
        this.currentSemesterName = s.name || 'Chưa xác định';
        this.cdr.detectChanges();
      }
    });

    this.timeContext.activePeriod$.subscribe(p => {
      this.activePeriodType = p?.type || null;
      this.cdr.detectChanges();
    });

    this.timeContext.majors$.subscribe(m => {
      this.majors = m;
      this.cdr.detectChanges();
    });
  }

  get isMajorPhase(): boolean {
    return this.activePeriodType === ProjectPeriodType.MajorSelection;
  }

  trackStep(_index: number, step: TimelineStep): string {
    return step.step;
  }

  trackChild(_index: number, child: { title: string }): string {
    return child.title;
  }

  getStepChildren(step: TimelineStep): TimelineChild[] {
    return step.children || [];
  }

  get displayTimeline(): TimelineStep[] {
    if (this.timeline?.length) return this.timeline;
    return this.dynamicTimeline;
  }

  private buildDynamicTimeline(periods: ProjectPeriodResponse[]): void {
    const now = new Date();

    this.dynamicTimeline = periods.map((p, index) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const isActive = now >= start && now <= end;
      const isCompleted = now > end;

      return {
        step: String(p.stage),
        title: p.name || `Giai đoạn ${p.stage}`,
        subtitle: this.getSubtitleForType(p.type),
        badge: isCompleted ? 'Hoàn thành' : isActive ? 'Đang diễn ra' : 'Sắp tới',
        badgeClass: isCompleted
          ? 'bg-green-50 text-green-700 border border-green-100'
          : isActive
            ? 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse'
            : 'bg-slate-100 text-slate-500 border border-slate-200',
        textClass: isActive ? 'text-blue-700' : 'text-slate-600',
        subtitleClass: isActive ? 'text-slate-500 mb-1' : 'text-slate-400 mb-1',
        active: isActive,
        completed: isCompleted,
        time: `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`,
        children: p.type === ProjectPeriodType.ProjectExecution ? [
          { title: 'Báo cáo tiến độ 1', muted: !isActive },
          { title: 'Báo cáo tiến độ 2', muted: !isActive },
          { title: 'Nộp đồ án', muted: !isActive },
        ] : []
      };
    });
  }

  private getSubtitleForType(type: ProjectPeriodType): string {
    switch (type) {
      case ProjectPeriodType.MajorSelection: return 'Chọn hướng chuyên ngành';
      case ProjectPeriodType.LecturerSelection: return 'Đăng ký GVHD';
      case ProjectPeriodType.LecturerReview: return 'Duyệt Đề tài & Nhóm';
      case ProjectPeriodType.ProjectExecution: return 'Thực hiện Đồ án';
      case ProjectPeriodType.FinalDefense: return 'Bảo vệ Hội đồng';
      default: return 'Giai đoạn học tập';
    }
  }
}
