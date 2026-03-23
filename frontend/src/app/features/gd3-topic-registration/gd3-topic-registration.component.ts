import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';

interface Topic {
  vi: string;
  en: string;
  desc: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
}

interface Member {
  id: string;
  name: string;
  leader: boolean;
}

@Component({
  selector: 'app-gd3-topic-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './gd3-topic-registration.component.html',
})
export class Gd3TopicRegistrationComponent {
  role: AppRole = 'student';
  userName = 'Nguyễn Văn A';
  userBadge = 'SV';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  readonly timeline: TimelineStep[] = [
    { step: '1', title: 'Giai đoạn 1', subtitle: 'Chọn Hướng Chuyên ngành', badge: 'Hoàn thành', badgeClass: 'bg-green-50 text-green-700 border border-green-100', textClass: 'text-slate-600', active: false, time: 'Đã kết thúc' },
    { step: '2', title: 'Giai đoạn 2', subtitle: 'Đăng ký GVHD', badge: 'Hoàn thành', badgeClass: 'bg-green-50 text-green-700 border border-green-100', textClass: 'text-slate-600', active: false, time: 'Đã kết thúc' },
    { step: '3', title: 'Giai đoạn 3', subtitle: 'Đăng ký đề tài', badge: 'Đang diễn ra', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100', textClass: 'text-blue-700', active: true, time: 'Phân công & đề tài' },
  ];
  topic: Topic = {
    vi: 'Xây dựng hệ thống Microservices cho sàn TMĐT',
    en: 'Building Microservices System for E-commerce',
    desc: 'Nghiên cứu kiến trúc Microservices, Docker, K8s...',
    status: 'draft',
  };
  members: Member[] = [
    { id: '2011001', name: 'Nguyễn Văn A', leader: true },
    { id: '2011002', name: 'Trần Thị B', leader: false },
    { id: '2011003', name: 'Lê Văn C', leader: false },
  ];
  lecturerModalOpen = false;

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

  submitTopic(): void {
    this.topic.status = 'pending';
  }

  openLecturerModal(): void {
    this.lecturerModalOpen = true;
  }

  closeLecturerModal(): void {
    this.lecturerModalOpen = false;
  }

  updateLeader(studentId: string): void {
    for (const member of this.members) {
      member.leader = member.id === studentId;
    }
  }

  approveTopic(): void {
    this.topic.status = 'approved';
  }

  rejectTopic(): void {
    this.topic.status = 'rejected';
  }
}
