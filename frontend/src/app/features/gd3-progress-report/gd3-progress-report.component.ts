import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';
import { AuthService } from '../../shared/services/auth.service';
import { Gd3Service } from '../gd3/services/gd3.service';

@Component({
  selector: 'app-gd3-progress-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './gd3-progress-report.component.html',
})
export class Gd3ProgressReportComponent implements OnInit {
  role: AppRole = 'student';
  private currentUserName = 'Nguyễn Văn A';
  private projectTeamId: string | null = null;
  private projectTopicId: string | null = null;
  private reportId: string | null = null;
  private mode: 'progress' | 'final' = 'progress';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  timeline: TimelineStep[] = [];
  loadingData = false;
  savingReport = false;
  report = {
    title: 'Báo cáo tiến độ',
    content: '',
    fileName: '',
    status: 'draft' as 'draft' | 'pending' | 'approved' | 'rejected',
  };
  detailModalOpen = false;
  rejectModalOpen = false;
  rejectReason = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly gd3Service: Gd3Service
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

  get pageTitle(): string {
    return this.mode === 'final' ? 'Nộp đồ án' : 'Báo cáo tiến độ';
  }

  get pageSubtitle(): string {
    return this.mode === 'final'
      ? 'Port từ `GD3/Baocaotiendo1va2vaNop/index.html` cho luồng nộp đồ án.'
      : 'Port từ `GD3/Baocaotiendo1va2vaNop/index.html`.';
  }

  get submitButtonLabel(): string {
    return this.mode === 'final' ? 'Nộp đồ án' : 'Gửi báo cáo';
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
    if (!this.report.content && !this.report.fileName) {
      return;
    }

    if (!this.projectTeamId || !this.projectTopicId) {
      this.addNotification(
        'TODO: Chưa có đủ projectTeamId hoặc projectTopicId để gọi POST /api/ProgressReport.'
      );
      return;
    }

    if (this.report.fileName.trim()) {
      this.addNotification(
        'TODO: Swagger chỉ nhận attachments dạng fileName + fileUrl, nhưng project hiện chưa có upload service hoặc upload endpoint để tạo fileUrl thật.'
      );
      return;
    }

    if (this.mode === 'final') {
      this.submitFinalSubmission();
      return;
    }

    this.savingReport = true;
    this.gd3Service
      .createProgressReport({
        projectTeamId: this.projectTeamId,
        projectTopicId: this.projectTopicId,
        title: this.report.title,
        summary: this.report.content,
        attachments: [],
      })
      .pipe(finalize(() => (this.savingReport = false)))
      .subscribe({
        next: (response) => {
          this.reportId = response.data?.id ?? null;
          this.report.status = 'pending';
          this.addNotification('Đã gửi báo cáo tiến độ theo swagger.');
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể gửi báo cáo tiến độ.'
          );
        },
      });
  }

  openDetailModal(): void {
    this.detailModalOpen = true;
  }

  closeDetailModal(): void {
    this.detailModalOpen = false;
  }

  approveReport(): void {
    this.report.status = 'approved';
    this.rejectReason = '';
  }

  openRejectModal(): void {
    this.rejectModalOpen = true;
  }

  closeRejectModal(): void {
    this.rejectModalOpen = false;
  }

  confirmReject(): void {
    if (!this.rejectReason) {
      return;
    }
    this.report.status = 'rejected';
    this.rejectModalOpen = false;
  }

  private loadPageData(): void {
    this.loadingData = true;
    this.mode = this.route.snapshot.queryParamMap.get('mode') === 'final' ? 'final' : 'progress';
    this.projectTeamId = this.route.snapshot.queryParamMap.get('teamId');
    this.projectTopicId = this.route.snapshot.queryParamMap.get('topicId');
    this.reportId = this.route.snapshot.queryParamMap.get('reportId');

    this.gd3Service
      .loadTimeline()
      .pipe(finalize(() => (this.loadingData = false)))
      .subscribe({
        next: (timeline) => {
          this.timeline = timeline;
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tải timeline Stage 3.'
          );
        },
      });

    if (this.projectTeamId) {
      this.gd3Service.getTeam(this.projectTeamId).subscribe({
        next: (response) => {
          const team = response.data;
          if (!team) {
            return;
          }

          this.projectTopicId = team.projectTopicId || this.projectTopicId;
        },
      });

      if (this.mode === 'final') {
        this.gd3Service.getFinalSubmissionByTeam(this.projectTeamId).subscribe({
          next: (response) => {
            const submission = response.data;
            if (!submission) {
              return;
            }

            this.reportId = submission.id;
            this.projectTopicId = submission.projectTopicId || this.projectTopicId;
            this.report.title = submission.reportTitle?.trim() || this.report.title;
            this.report.fileName = submission.attachments?.[0]?.fileName?.trim() || '';
            this.report.status = 'pending';
          },
          error: () => {
            // No existing final submission for this team yet.
          },
        });
      }
    }

    if (this.projectTopicId && !this.projectTeamId) {
      this.gd3Service.getTopic(this.projectTopicId).subscribe({
        next: (response) => {
          const topic = response.data;
          if (!topic) {
            return;
          }

          this.projectTeamId = topic.projectTeamId || this.projectTeamId;
          this.report.title = topic.title?.trim()
            ? `Báo cáo tiến độ - ${topic.title.trim()}`
            : this.report.title;
        },
      });
    }

    if (this.reportId) {
      if (this.mode === 'final') {
        return;
      }

      this.gd3Service.getProgressReport(this.reportId).subscribe({
        next: (response) => {
          const report = response.data;
          if (!report) {
            return;
          }

          this.projectTeamId = report.projectTeamId || this.projectTeamId;
          this.projectTopicId = report.projectTopicId || this.projectTopicId;
          this.report.title = report.title?.trim() || this.report.title;
          this.report.content = report.summary?.trim() || this.report.content;
          this.report.fileName = report.attachments?.[0]?.fileName?.trim() || '';
          this.report.status = 'pending';
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tải chi tiết báo cáo.'
          );
        },
      });
    }
  }

  private submitFinalSubmission(): void {
    this.savingReport = true;
    this.gd3Service
      .createFinalSubmission({
        projectTeamId: this.projectTeamId!,
        projectTopicId: this.projectTopicId!,
        reportTitle: this.report.title,
        attachments: [],
      })
      .pipe(finalize(() => (this.savingReport = false)))
      .subscribe({
        next: (response) => {
          this.reportId = response.data?.id ?? null;
          this.report.status = 'pending';
          this.addNotification('Đã nộp đồ án theo swagger.');
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể nộp đồ án.'
          );
        },
      });
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
