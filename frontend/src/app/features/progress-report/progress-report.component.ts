import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';
import { AuthService } from '../../shared/services/auth.service';
import { ProjectManagementService } from '../project-management/services/project-management.service';
import { APP_ICONS } from '../../shared/icons/app-icons';

interface Report {
  id: string;
  title: string;
  date: string;
  status: 'submitted' | 'late' | 'missing';
}

@Component({
  selector: 'app-progress-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './progress-report.component.html',
})
export class ProgressReportComponent implements OnInit {
  @Input() hideLayout = false;
  role: AppRole = 'student';
  private currentUserName = 'Nguyễn Văn A';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  timeline: TimelineStep[] = [];
  loadingData = false;
  readonly icons = APP_ICONS;
  
  reports: Report[] = [
    { id: '1', title: 'Báo cáo Tiến độ 1', date: '2024-04-10', status: 'submitted' },
    { id: '2', title: 'Báo cáo Tiến độ 2', date: '2024-05-15', status: 'missing' },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly projectManagementService: ProjectManagementService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getCurrentRole();

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserName =
        currentUser.fullName?.trim() || currentUser.userName?.trim() || this.currentUserName;
    }

    this.loadPageData();
  }

  get userName(): string {
    return this.currentUserName;
  }

  get userBadge(): string {
    return this.role === 'lecturer' ? 'GV' : 'SV';
  }

  switchRole(_role: AppRole): void {
    // Role is driven by login response for now.
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  submitReport(): void {
     this.addNotification('Tính năng nộp báo cáo tiến độ đang được phát triển.');
  }

  private loadPageData(): void {
    this.loadingData = true;
    this.projectManagementService
      .loadTimeline()
      .pipe(finalize(() => (this.loadingData = false)))
      .subscribe({
        next: (timeline) => {
          this.timeline = timeline;
        },
      });
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
