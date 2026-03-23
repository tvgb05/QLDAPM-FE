import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';
import { Gd2RegistrationCardComponent } from './components/gd2-registration-card.component';
import { Gd2RequestCardComponent } from './components/gd2-request-card.component';
import { Gd2Tab, GroupItem, RegistrationItem } from './gd2.models';

@Component({
  selector: 'app-gd2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AppHeaderComponent,
    ProjectTimelineComponent,
    Gd2RegistrationCardComponent,
    Gd2RequestCardComponent,
  ],
  templateUrl: './gd2.component.html',
})
export class Gd2Component {
  role: AppRole = 'student';
  userName = 'Nguyễn Văn A';
  userBadge = 'SV';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  activeTab: Gd2Tab = 'pending';
  searchTerm = '';
  readonly icons = APP_ICONS;
  readonly timeline: TimelineStep[] = [
    {
      step: '1',
      title: 'Giai đoạn 1',
      subtitle: 'Chọn hướng chuyên ngành',
      badge: 'Hoàn thành',
      badgeClass: 'bg-green-50 text-green-700 border border-green-100',
      textClass: 'text-slate-700',
      subtitleClass: 'text-slate-500 mb-1',
      active: false,
      completed: true,
    },
    {
      step: '2',
      title: 'Giai đoạn 2',
      subtitle: 'Đăng ký GVHD',
      badge: 'Đang diễn ra',
      badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100',
      textClass: 'text-blue-700',
      subtitleClass: 'text-slate-500 mb-1',
      stepNumberClass: 'text-slate-500',
      active: true,
      time: 'Thời gian đăng ký 20/02 - 25/02',
    },
    {
      step: '3',
      title: 'Giai đoạn 3',
      subtitle: 'Thực hiện Đồ án',
      textClass: 'text-slate-500',
      subtitleClass: 'text-slate-400 mb-2',
      active: false,
      children: [
        { title: 'Phân công chính thức' },
        { title: 'Báo cáo tiến độ 1', muted: true },
        { title: 'Báo cáo tiến độ 2', muted: true },
        { title: 'Nộp đồ án', muted: true },
        { title: 'Bảo vệ Hội đồng', emphasis: true, outlined: true },
      ],
    },
  ];
  studentRegistrations: RegistrationItem[] = [
    {
      initials: 'NV',
      lecturer: 'TS. Nguyễn Văn A',
      tag: 'CNPM',
      specialty: 'Công nghệ phần mềm',
      quotaLabel: 'Đã đăng ký',
      quotaValue: '5/20',
      progress: 25,
      progressClass: 'bg-blue-500',
      tone: 'blue',
      full: false,
      registered: false,
    },
    {
      initials: 'LV',
      lecturer: 'TS. Lê Văn C',
      tag: 'Mạng',
      specialty: 'Mạng máy tính',
      quotaLabel: 'Đã đăng ký',
      quotaValue: '12/20',
      progress: 60,
      progressClass: 'bg-yellow-400',
      tone: 'purple',
      full: false,
      registered: false,
    },
    {
      initials: 'TT',
      lecturer: 'ThS. Trần Thị B',
      tag: 'AI',
      specialty: 'Trí tuệ nhân tạo',
      quotaLabel: 'Đã đăng ký',
      quotaValue: '15/15',
      progress: 100,
      progressClass: 'bg-red-500',
      tone: 'slate',
      full: true,
      registered: false,
    },
  ];
  pendingGroups: GroupItem[] = [
    {
      name: 'Lê Hoàng Nam',
      studentId: '2011001',
      specialization: 'Công nghệ phần mềm',
      initials: 'LHN',
      tone: 'blue',
      decision: 'none',
    },
    {
      name: 'Nguyễn Thúy Vy',
      studentId: '2011002',
      specialization: 'Trí tuệ nhân tạo',
      initials: 'NTV',
      tone: 'purple',
      decision: 'none',
    },
  ];
  acceptedGroups: GroupItem[] = [];

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

  get pageTitle(): string {
    return this.role === 'student' ? 'Đăng ký Giảng viên Hướng dẫn' : 'Duyệt sinh viên đăng ký';
  }

  get filteredRegistrations(): RegistrationItem[] {
    const keyword = this.searchTerm.trim().toLowerCase();
    if (!keyword) {
      return this.studentRegistrations;
    }

    return this.studentRegistrations.filter((item) =>
      [item.lecturer, item.tag, item.specialty].some((value) => value.toLowerCase().includes(keyword))
    );
  }

  get pendingCount(): number {
    return this.pendingGroups.filter((group) => group.decision === 'none').length;
  }

  get acceptedCount(): number {
    return this.acceptedGroups.filter((group) => group.decision === 'approved').length;
  }

  toggleRegister(item: RegistrationItem): void {
    if (item.full) {
      return;
    }

    item.registered = !item.registered;
    this.addNotification(
      item.registered
        ? `Đăng ký thành công GVHD <b>${item.lecturer}</b>.`
        : `Đã hủy đăng ký GVHD <b>${item.lecturer}</b>.`
    );
  }

  switchLecturerTab(tab: Gd2Tab): void {
    this.activeTab = tab;
  }

  approveAll(): void {
    for (const group of this.pendingGroups.filter((item) => item.decision === 'none')) {
      this.handleLecturerAction(group, 'approve');
    }
  }

  handleLecturerAction(group: GroupItem, action: 'approve' | 'reject'): void {
    if (action === 'approve') {
      group.decision = 'approved';
      this.pendingGroups = this.pendingGroups.filter((item) => item !== group);
      this.acceptedGroups = [...this.acceptedGroups, group];
      this.addNotification(`Bạn đã duyệt yêu cầu của <b>${group.name}</b>.`);
      return;
    }

    group.decision = 'rejected';
    this.addNotification(`Bạn đã từ chối yêu cầu của <b>${group.name}</b>.`);
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
