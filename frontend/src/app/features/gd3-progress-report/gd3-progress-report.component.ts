import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';

@Component({
  selector: 'app-gd3-progress-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './gd3-progress-report.component.html',
})
export class Gd3ProgressReportComponent {
  role: AppRole = 'student';
  userName = 'Nguyễn Văn A';
  userBadge = 'SV';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  readonly timeline: TimelineStep[] = [
    { step: '1', title: 'Giai đoạn 1', subtitle: 'Chọn Hướng Chuyên ngành', badge: 'Hoàn thành', badgeClass: 'bg-green-50 text-green-700 border border-green-100', textClass: 'text-slate-600', active: false, time: 'Đã kết thúc' },
    { step: '2', title: 'Giai đoạn 2', subtitle: 'Đăng ký GVHD', badge: 'Hoàn thành', badgeClass: 'bg-green-50 text-green-700 border border-green-100', textClass: 'text-slate-600', active: false, time: 'Đã kết thúc' },
    { step: '3', title: 'Giai đoạn 3', subtitle: 'Báo cáo tiến độ', badge: 'Đang diễn ra', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100', textClass: 'text-blue-700', active: true, time: 'Phân công & đề tài' },
  ];
  report = {
    content: '',
    fileName: '',
    status: 'draft' as 'draft' | 'pending' | 'approved' | 'rejected',
  };
  detailModalOpen = false;
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

  submitReport(): void {
    if (!this.report.content && !this.report.fileName) {
      return;
    }
    this.report.status = 'pending';
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
}
