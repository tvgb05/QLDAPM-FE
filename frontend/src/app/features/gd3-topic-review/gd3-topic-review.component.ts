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
  selector: 'app-gd3-topic-review',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './gd3-topic-review.component.html',
})
export class Gd3TopicReviewComponent implements OnInit {
  role: AppRole = 'student';
  private currentUserName = 'Nguyễn Văn A';
  private topicId: string | null = null;
  private lecturerId: string | null = null;
  showNotifications = false;
  notifications: NotificationItem[] = [];
  timeline: TimelineStep[] = [];
  loadingData = false;
  topicTitle = 'Xây dựng hệ thống Microservices cho sàn TMĐT';
  topicDescription = 'Nghiên cứu kiến trúc Microservices, Docker, K8s...';
  topicStatus: 'pending' | 'approved' | 'rejected' = 'pending';
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

  approveTopic(): void {
    if (!this.topicId) {
      this.addNotification('TODO: Chưa có topicId để gọi PUT /api/ProjectTopic/{id}.');
      return;
    }

    this.addNotification(
      'TODO: Swagger chưa nêu rõ numeric status cho approve topic, nên mình chưa gửi PUT để tránh sai dữ liệu.'
    );
  }

  openRejectModal(): void {
    this.rejectModalOpen = true;
  }

  closeRejectModal(): void {
    this.rejectModalOpen = false;
    this.rejectReason = '';
  }

  confirmReject(): void {
    if (!this.rejectReason) {
      return;
    }

    if (!this.topicId) {
      this.addNotification('TODO: Chưa có topicId để gọi PUT /api/ProjectTopic/{id}.');
      return;
    }

    this.addNotification(
      'TODO: Swagger chưa nêu rõ numeric status cho reject topic, nên mình chưa gửi PUT để tránh sai dữ liệu.'
    );
  }

  private loadPageData(): void {
    this.loadingData = true;
    this.topicId = this.route.snapshot.queryParamMap.get('topicId');

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

    this.gd3Service.loadLecturerContext(this.authService.getCurrentUser()).subscribe({
      next: (context) => {
        this.lecturerId = context.lecturerId;
      },
    });

    if (!this.topicId) {
      this.addNotification('TODO: Chưa có topicId trên route để fetch GET /api/ProjectTopic/{id}.');
      return;
    }

    this.gd3Service.getTopic(this.topicId).subscribe({
      next: (response) => {
        const topic = response.data;
        if (!topic) {
          return;
        }

        this.topicTitle = topic.title?.trim() || this.topicTitle;
        this.topicDescription = topic.description?.trim() || this.topicDescription;

        if (topic.status != null) {
          this.addNotification(
            'TODO: Swagger chưa nêu rõ enum status của ProjectTopic, nên UI không map số status sang nhãn cụ thể.'
          );
        }

        if (!this.lecturerId) {
          this.addNotification(
            'TODO: Chưa xác định được lecturerId hiện tại để truyền approvedLecturerId khi backend chốt enum status.'
          );
        }
      },
      error: (error: { message?: string; error?: { message?: string | null } }) => {
        this.addNotification(
          error.error?.message ?? error.message ?? 'Không thể tải chi tiết đề tài.'
        );
      },
    });
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
