import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LecturerAssignmentCardComponent } from './components/lecturer-assignment-card.component';
import { SpecializationCardComponent } from './components/specialization-card.component';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { NotificationItem, TimelineStep } from '../../shared/models/ui.models';
import { LecturerAssignment, Gd1Role, Specialization } from './gd1.models';

@Component({
  selector: 'app-gd1',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AppHeaderComponent,
    ProjectTimelineComponent,
    LecturerAssignmentCardComponent,
    SpecializationCardComponent,
  ],
  templateUrl: './gd1.component.html',
})
export class Gd1Component {
  readonly icons = APP_ICONS;
  role: Gd1Role = 'student';
  showNotifications = false;
  selectedSpecializationId: string | null = null;
  notifications: NotificationItem[] = [];

  get userName(): string {
    return this.role === 'lecturer' ? 'TS. Giảng viên A' : 'Nguyễn Văn A';
  }

  get userBadge(): string {
    return this.role === 'lecturer' ? 'GV' : 'SV';
  }

  readonly timeline: TimelineStep[] = [
    {
      step: '1',
      title: 'Giai đoạn 1',
      subtitle: 'Chọn Hướng Chuyên ngành',
      badge: 'Đang diễn ra',
      badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100',
      textClass: 'text-blue-700',
      active: true,
      time: 'Thời gian đăng ký 10/2 - 20/2',
    },
    {
      step: '2',
      title: 'Giai đoạn 2',
      subtitle: 'Đăng ký GVHD',
      badge: 'Sắp tới',
      badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
      textClass: 'text-slate-600',
      active: false,
      time: 'Thời gian đăng ký 20/02 - 25/02',
    },
    {
      step: '3',
      title: 'Giai đoạn 3',
      subtitle: 'Thực hiện Đồ án',
      textClass: 'text-slate-500',
      active: false,
    },
  ];

  readonly specializations: Specialization[] = [
    {
      id: 'cnpm',
      name: 'Công nghệ phần mềm',
      color: 'blue',
      icon: 'code',
      accentIcon: 'layoutTemplate',
      description:
        'Phát triển ứng dụng Web, Mobile App, Kiến trúc phần mềm, Microservices, DevOps, Testing.',
    },
    {
      id: 'httt',
      name: 'Hệ thống thông tin',
      color: 'orange',
      icon: 'server',
      accentIcon: 'database',
      description:
        'Phân tích dữ liệu, Data Mining, ERP, Quản trị cơ sở dữ liệu, Business Intelligence, E-commerce.',
    },
    {
      id: 'mang',
      name: 'Mạng & An toàn thông tin',
      color: 'green',
      icon: 'globe',
      accentIcon: 'shieldCheck',
      description:
        'Quản trị mạng, Pentest, Blockchain, IoT Security, Cloud Infrastructure, System Admin.',
    },
    {
      id: 'ai',
      name: 'Trí tuệ nhân tạo (AI)',
      color: 'purple',
      icon: 'cpu',
      accentIcon: 'brainCircuit',
      description:
        'Machine Learning, Deep Learning, Computer Vision, NLP, Generative AI, Data Science.',
    },
  ];

  readonly lecturerAssignments: LecturerAssignment[] = [
    {
      name: 'Công nghệ phần mềm',
      faculty: 'Khoa Khoa học và Kỹ thuật Máy tính',
      subjectCode: 'SE501',
      quota: 'Tối đa 5 nhóm',
      color: 'blue',
      icon: 'code',
    },
    {
      name: 'Trí tuệ nhân tạo (AI)',
      faculty: 'Khoa Khoa học và Kỹ thuật Máy tính',
      subjectCode: 'AI502',
      quota: 'Tối đa 3 nhóm',
      color: 'purple',
      icon: 'cpu',
    },
  ];

  switchRole(role: Gd1Role): void {
    this.role = role;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  toggleSelection(target: Specialization): void {
    if (this.selectedSpecializationId && this.selectedSpecializationId !== target.id) {
      this.addNotification(
        'Bạn chỉ được chọn 1 chuyên ngành. Vui lòng hủy chuyên ngành hiện tại trước khi chọn cái mới.'
      );
      return;
    }

    if (this.selectedSpecializationId === target.id) {
      this.selectedSpecializationId = null;
      this.addNotification(`Bạn đã hủy đăng ký hướng chuyên ngành: ${target.name}`);
      return;
    }

    this.selectedSpecializationId = target.id;
    this.addNotification(`Đăng ký thành công hướng chuyên ngành: ${target.name}`);
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
