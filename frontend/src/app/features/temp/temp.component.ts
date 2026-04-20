import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';

type TempStatus = 'pending' | 'approved' | 'rejected';

@Component({
  selector: 'app-temp',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './temp.component.html',
})
export class TempComponent {
  readonly icons = APP_ICONS;
  role: AppRole = 'student';
  userName = 'Nguyễn Văn A';
  userBadge = 'SV';
  showNotifications = false;
  notifications: NotificationItem[] = [{ message: 'Đề tài của nhóm đang chờ giảng viên phản hồi.' }];
  status: TempStatus = 'pending';
  rejectModalOpen = false;
  rejectReason = '';
  readonly timeline: TimelineStep[] = [
    {
      step: '1',
      title: 'Giai đoạn 1',
      subtitle: 'Chọn hướng chuyên ngành',
      textClass: 'text-slate-500',
      subtitleClass: 'text-slate-400',
      active: false,
      completed: true,
    },
    {
      step: '2',
      title: 'Giai đoạn 2',
      subtitle: 'Đăng ký & Duyệt GVHD',
      textClass: 'text-slate-500',
      subtitleClass: 'text-slate-400',
      active: false,
      completed: true,
    },
    {
      step: '3',
      title: 'Giai đoạn 3',
      subtitle: 'Thực hiện Đồ án',
      textClass: 'text-blue-700',
      subtitleClass: 'text-slate-500 mb-2',
      stepNumberClass: 'text-blue-600',
      active: true,
      children: [
        { title: 'Phân công & Đề tài', emphasis: true },
      ],
    },
  ];

  switchRole(role: AppRole): void {
    this.role = role;
    this.userName = role === 'lecturer' ? 'TS. Giảng Viên A' : 'Nguyễn Văn A';
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
    this.status = 'approved';
    this.notifications.unshift({ message: 'Đề tài của nhóm 05 đã được duyệt.' });
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
    this.status = 'rejected';
    this.notifications.unshift({ message: `Đã gửi phản hồi yêu cầu sửa: "${this.rejectReason}"` });
    this.rejectModalOpen = false;
  }

  get studentBannerClass(): string {
    if (this.status === 'approved') {
      return 'bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-2';
    }
    if (this.status === 'rejected') {
      return 'bg-red-50 border border-red-200 px-4 py-2 rounded-xl flex items-center gap-2 animate-bounce';
    }
    return 'bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-2';
  }
}
