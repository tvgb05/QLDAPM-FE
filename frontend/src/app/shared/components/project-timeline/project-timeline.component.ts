import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
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
  readonly academicYear = 'Niên khóa 2025-2026';
  readonly defaultStageThreeChildren = [
    { title: 'Phân công chính thức' },
    { title: 'Báo cáo tiến độ 1', muted: true },
    { title: 'Báo cáo tiến độ 2', muted: true },
    { title: 'Nộp đồ án', muted: true },
    { title: 'Bảo vệ hội đồng', emphasis: true, outlined: true },
  ];

  constructor(private readonly router: Router) {}

  trackStep(_index: number, step: TimelineStep): string {
    return step.step;
  }

  trackChild(_index: number, child: { title: string }): string {
    return child.title;
  }

  getStepChildren(step: TimelineStep): { title: string; muted?: boolean; emphasis?: boolean; outlined?: boolean }[] {
    if (step.children?.length) {
      return step.children;
    }

    if (step.step === '3') {
      return this.defaultStageThreeChildren;
    }

    return [];
  }

  get displayTimeline(): TimelineStep[] {
    const baseTimeline = this.timeline?.length ? this.timeline : this.buildFallbackTimeline();
    return this.normalizeTimelineForRoute(baseTimeline);
  }

  private buildFallbackTimeline(): TimelineStep[] {
    const url = this.router.url;
    const activeStage = url.includes('/gd1')
      ? 1
      : url.includes('/gd2')
        ? 2
        : 3;

    return [1, 2, 3].map((stage) => {
      const completed = stage < activeStage;
      const active = stage === activeStage;

      return {
        step: String(stage),
        title: `Giai đoạn ${stage}`,
        subtitle:
          stage === 1
            ? 'Chọn Hướng Chuyên ngành'
            : stage === 2
              ? 'Đăng ký GVHD'
              : 'Thực hiện Đồ án',
        badge: completed ? 'Hoàn thành' : active ? 'Đang diễn ra' : 'Sắp tới',
        badgeClass: completed
          ? 'bg-green-50 text-green-700 border border-green-100'
          : active
            ? 'bg-blue-50 text-blue-700 border border-blue-100'
            : 'bg-slate-100 text-slate-500 border border-slate-200',
        textClass: active ? 'text-blue-700' : 'text-slate-600',
        subtitleClass: active ? 'text-slate-500 mb-1' : 'text-slate-400 mb-1',
        active,
        completed,
      };
    });
  }

  private normalizeTimelineForRoute(timeline: TimelineStep[]): TimelineStep[] {
    const currentStage = this.getRouteStage();

    return timeline.map((step) => {
      const stepNumber = Number(step.step);
      const isCompleted = stepNumber < currentStage;
      const isActive = stepNumber === currentStage;
      const isImmediateNext = stepNumber === currentStage + 1;
      const isFuture = stepNumber > currentStage + 1;

      if (isCompleted) {
        return {
          ...step,
          active: false,
          completed: true,
          badge: 'Hoàn thành',
          badgeClass: 'bg-green-50 text-green-700 border border-green-100',
          textClass: 'text-slate-600',
          subtitleClass: 'text-slate-400 mb-1',
        };
      }

      if (isActive) {
        return {
          ...step,
          active: true,
          completed: false,
          badge: 'Đang diễn ra',
          badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100',
          textClass: 'text-blue-700',
          subtitleClass: 'text-slate-500 mb-1',
        };
      }

      if (isImmediateNext) {
        return {
          ...step,
          active: false,
          completed: false,
          badge: 'Sắp tới',
          badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
          textClass: 'text-slate-600',
          subtitleClass: 'text-slate-400 mb-1',
        };
      }

      if (isFuture) {
        return {
          ...step,
          active: false,
          completed: false,
          badge: undefined,
          badgeClass: undefined,
          time: undefined,
          textClass: 'text-slate-600',
          subtitleClass: 'text-slate-400 mb-1',
        };
      }

      return step;
    });
  }

  private getRouteStage(): number {
    const url = this.router.url;

    if (url.includes('/gd1')) {
      return 1;
    }

    if (url.includes('/gd2')) {
      return 2;
    }

    return 3;
  }
}
