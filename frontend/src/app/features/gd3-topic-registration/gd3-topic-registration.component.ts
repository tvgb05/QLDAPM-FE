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
export class Gd3TopicRegistrationComponent implements OnInit {
  role: AppRole = 'student';
  private currentUserName = 'Nguyễn Văn A';
  private studentId: string | null = null;
  private projectPeriodId: string | null = null;
  private teamId: string | null = null;
  private topicId: string | null = null;
  private teacherId: string | null = null;
  showNotifications = false;
  notifications: NotificationItem[] = [];
  timeline: TimelineStep[] = [];
  loadingData = false;
  savingTopic = false;
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

  submitTopic(): void {
    if (!this.studentId || !this.projectPeriodId) {
      this.addNotification(
        'TODO: Chưa xác định được studentId hoặc projectPeriodId cho Stage 3.'
      );
      return;
    }

    if (this.topicId) {
      this.savingTopic = true;
      this.gd3Service
        .updateTopic(this.topicId, {
          title: this.topic.vi,
          description: this.topic.desc,
        })
        .pipe(finalize(() => (this.savingTopic = false)))
        .subscribe({
          next: () => {
            this.topic.status = 'pending';
            this.addNotification('Đã cập nhật đề tài theo dữ liệu backend.');
          },
          error: (error: { message?: string; error?: { message?: string | null } }) => {
            this.addNotification(
              error.error?.message ?? error.message ?? 'Không thể cập nhật đề tài.'
            );
          },
        });
      return;
    }

    if (!this.teamId || !this.teacherId) {
      this.addNotification(
        'TODO: Chưa có đủ projectTeamId hoặc teacherId để gọi POST /api/ProjectTopic theo swagger.'
      );
      return;
    }

    this.savingTopic = true;
    this.gd3Service
      .createTopic({
        projectTeamId: this.teamId,
        teacherId: this.teacherId,
        title: this.topic.vi,
        description: this.topic.desc,
      })
      .pipe(finalize(() => (this.savingTopic = false)))
      .subscribe({
        next: (response) => {
          this.topicId = response.data?.id ?? null;
          this.topic.status = 'pending';
          this.addNotification('Đã tạo đề tài theo swagger.');
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tạo đề tài.'
          );
        },
      });
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
    if (!this.topicId) {
      this.addNotification(
        'TODO: Chưa có projectTopicId an toàn từ code hiện tại để gọi PUT /api/ProjectTopic/{id}.'
      );
      return;
    }

    this.addNotification(
      'TODO: Swagger chưa nêu rõ numeric status cho approve topic, nên mình chưa gửi PUT để tránh sai dữ liệu.'
    );
  }

  rejectTopic(): void {
    if (!this.topicId) {
      this.addNotification(
        'TODO: Chưa có projectTopicId an toàn từ code hiện tại để gọi PUT /api/ProjectTopic/{id}.'
      );
      return;
    }

    this.addNotification(
      'TODO: Swagger chưa nêu rõ numeric status cho reject topic, nên mình chưa gửi PUT để tránh sai dữ liệu.'
    );
  }

  private loadPageData(): void {
    this.loadingData = true;
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.topicId = this.route.snapshot.queryParamMap.get('topicId');
    this.teacherId = this.route.snapshot.queryParamMap.get('teacherId');

    this.gd3Service
      .loadTimeline()
      .pipe(finalize(() => (this.loadingData = false)))
      .subscribe({
        next: (timeline) => {
          this.timeline = timeline;
        },
      });

    this.gd3Service.loadStudentContext(this.authService.getCurrentUser()).subscribe({
        next: (context) => {
          this.studentId = context.studentId;
          this.projectPeriodId = context.projectPeriodId;
        },
    });

    if (this.teamId) {
      this.gd3Service.getTeam(this.teamId).subscribe({
        next: (response) => {
          const team = response.data;
          if (!team) {
            return;
          }

          this.projectPeriodId = team.projectPeriodId || this.projectPeriodId;
          this.topicId = team.projectTopicId || this.topicId;
        },
      });
    }

    if (this.topicId) {
      this.gd3Service.getTopic(this.topicId).subscribe({
        next: (response) => {
          const topic = response.data;
          if (!topic) {
            return;
          }

          this.teamId = topic.projectTeamId || this.teamId;
          this.teacherId = topic.teacherId || this.teacherId;
          this.topic.vi = topic.title?.trim() || this.topic.vi;
          this.topic.en = topic.title?.trim() || this.topic.en;
          this.topic.desc = topic.description?.trim() || this.topic.desc;

          if (topic.status != null) {
            this.addNotification(
              'TODO: Swagger chưa nêu rõ enum status của ProjectTopic, nên UI không map số status sang nhãn cụ thể.'
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
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
