import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';

@Component({
  selector: 'app-gd3-topic-review',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './gd3-topic-review.component.html',
})
export class Gd3TopicReviewComponent {
  role: AppRole = 'lecturer';
  userName = 'TS. Giảng viên A';
  userBadge = 'GV';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  readonly timeline: TimelineStep[] = [
    { step: '1', title: 'Giai đoạn 1', subtitle: 'Chọn Hướng Chuyên ngành', badge: 'Hoàn thành', badgeClass: 'bg-green-50 text-green-700 border border-green-100', textClass: 'text-slate-600', active: false, time: 'Đã kết thúc' },
    { step: '2', title: 'Giai đoạn 2', subtitle: 'Đăng ký GVHD', badge: 'Hoàn thành', badgeClass: 'bg-green-50 text-green-700 border border-green-100', textClass: 'text-slate-600', active: false, time: 'Đã kết thúc' },
    { step: '3', title: 'Giai đoạn 3', subtitle: 'Duyệt đề tài', badge: 'Đang diễn ra', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100', textClass: 'text-blue-700', active: true, time: 'Phân công & đề tài' },
  ];
  topicStatus: 'pending' | 'approved' | 'rejected' = 'pending';
  rejectModalOpen = false;
  rejectReason = '';

  switchRole(role: AppRole): void {
    this.role = role;
    this.userName = role === 'lecturer' ? 'TS. Giảng viên A' : 'Nguyễn Văn A';
    this.userBadge = role === 'lecturer' ? 'GV' : 'SV';
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  approveTopic(): void {
    this.topicStatus = 'approved';
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
    this.topicStatus = 'rejected';
    this.rejectModalOpen = false;
  }
}
