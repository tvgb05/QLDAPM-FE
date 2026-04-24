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

interface TopicReviewItem {
  id: string;
  name: string;
  studentId: string;
  major: string;
  title: string;
  submittedAt: string;
}

@Component({
  selector: 'app-topic-review',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './topic-review.component.html',
})
export class TopicReviewComponent implements OnInit {
  @Input() hideLayout = false;
  role: AppRole = 'lecturer';
  private currentUserName = 'Nguyễn Văn A';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  timeline: TimelineStep[] = [];
  loadingData = false;
  readonly icons = APP_ICONS;
  pendingTopics: TopicReviewItem[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      studentId: '2011001',
      major: 'Kỹ thuật Phần mềm',
      title: 'Xây dựng hệ thống Microservices cho sàn TMĐT',
      submittedAt: '2024-03-20',
    },
    {
       id: '2',
       name: 'Trần Thị B',
       studentId: '2011002',
       major: 'Trí tuệ nhân tạo',
       title: 'Ứng dụng Học máy trong chẩn đoán y khoa',
       submittedAt: '2024-03-21',
    },
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

  approveTopic(topic: TopicReviewItem): void {
     this.addNotification(`Đã duyệt đề tài của sinh viên <b>${topic.name}</b>.`);
  }

  rejectTopic(topic: TopicReviewItem): void {
     this.addNotification(`Đã từ chối đề tài của sinh viên <b>${topic.name}</b>.`);
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
