import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { AppRole, NotificationItem } from '../../shared/models/ui.models';
import { PdtAdminSidebarComponent } from './components/pdt-admin-sidebar.component';
import { PdtTab, ReportKey, ReportSection, TopicItem, UnassignedStudent, AvailableGroup } from './pdt.models';

@Component({
  selector: 'app-pdt',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AppHeaderComponent,
    PdtAdminSidebarComponent,
  ],
  templateUrl: './pdt.component.html',
})
export class PdtComponent {
  readonly icons = APP_ICONS;
  role: AppRole = 'student';
  userName = 'Nguyễn Văn A';
  userBadge = 'PDT';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  activeTab: PdtTab = 'time';
  assignModalOpen = false;
  assignStudentName = '';
  reportItems: Record<ReportKey, boolean> = {
    topic01: true,
    topic02: false,
  };

  readonly topics: TopicItem[] = [
    {
      title: 'Chuyên ngành gì đó',
      code: 'DT-001',
      faculty: 'K.H.M.T',
      facultyClass: 'bg-blue-100 text-blue-700',
      lecturers: ['TS. Nguyễn Văn A', 'ThS. Lê Văn C'],
    },
    {
      title: 'Chuyên ngành gì đó nữa',
      code: 'DT-002',
      faculty: 'Điện - Điện tử',
      facultyClass: 'bg-green-100 text-green-700',
      lecturers: ['TS. Trần Thị B'],
    },
  ];

  readonly unassignedStudents: UnassignedStudent[] = [
    { name: 'Phạm Văn D', studentId: '2011005', faculty: 'K.H.M.T' },
    { name: 'Lê Thị E', studentId: '2011006', faculty: 'K.H.M.T' },
  ];

  readonly availableGroups: AvailableGroup[] = [
    {
      title: 'Chuyên ngành gì đó',
      slots: 'Còn 2 chỗ',
      slotsClass: 'bg-green-100 text-green-700',
      lecturers: 'GV: TS. Nguyễn Văn A, ThS. Lê Văn C',
      members: ['A', 'B'],
      progressClass: 'bg-green-500',
      progress: 60,
      memberCount: '3/5 Thành viên',
    },
    {
      title: 'Chuyên ngành gì đó nữa',
      slots: 'Còn 1 chỗ',
      slotsClass: 'bg-yellow-100 text-yellow-700',
      lecturers: 'GV: TS. Trần Thị B',
      members: ['D', 'E', 'F', 'G'],
      progressClass: 'bg-yellow-500',
      progress: 80,
      memberCount: '4/5 Thành viên',
    },
  ];

  readonly reportSections: ReportSection[] = [
    {
      key: 'topic01' as const,
      badgeClass: 'bg-indigo-100 text-indigo-700',
      title: 'Phát triển Ứng dụng Web & Mobile',
      lecturers: ['TS. Nguyễn Văn A', 'ThS. Lê Văn C'],
      groupCount: '02',
      rows: [
        {
          group: 'N01',
          title: 'Hệ thống E-commerce đa nền tảng',
          ids: ['2011001', '2011002'],
          students: ['Trần Văn X', 'Lê Thị Y'],
          advisor: 'TS. Nguyễn Văn A',
          status: 'Hoàn thành',
          statusClass: 'bg-green-100 text-green-700',
          rowClass: '',
        },
        {
          group: 'N02',
          title: 'Ứng dụng đặt món ăn (Food Delivery)',
          ids: ['2011005', '2011008', '2011009'],
          students: ['Phạm Văn Z', 'Đỗ Thị K', 'Hoàng Văn M'],
          advisor: 'ThS. Lê Văn C',
          status: 'Đang làm',
          statusClass: 'bg-yellow-100 text-yellow-700',
          rowClass: 'bg-slate-50/30',
        },
      ],
    },
    {
      key: 'topic02' as const,
      badgeClass: 'bg-pink-100 text-pink-700',
      title: 'Trí tuệ nhân tạo (AI) & Computer Vision',
      lecturers: ['PGS. TS. Trần Thị B'],
      groupCount: '01',
      rows: [
        {
          group: 'N03',
          title: 'Hệ thống nhận diện khuôn mặt điểm danh',
          ids: ['2011020'],
          students: ['Ngô Văn P'],
          advisor: 'PGS. TS. Trần Thị B',
          status: 'Cảnh báo',
          statusClass: 'bg-red-100 text-red-700',
          rowClass: '',
        },
      ],
    },
  ];

  switchRole(role: AppRole): void {
    this.role = role;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  switchAdminTab(tabName: PdtTab): void {
    this.activeTab = tabName;
  }

  openAssignModal(studentName: string): void {
    this.assignStudentName = studentName;
    this.assignModalOpen = true;
  }

  confirmAssign(): void {
    this.notifications.unshift({
      message: `Đã phân công sinh viên vào nhóm thành công: <b>${this.assignStudentName}</b>.`,
    });
    this.assignModalOpen = false;
  }

  toggleReportItem(id: ReportKey): void {
    this.reportItems[id] = !this.reportItems[id];
  }

  saveConfig(): void {
    this.notifications.unshift({ message: 'Đã lưu cấu hình thời gian đăng ký.' });
  }
}
