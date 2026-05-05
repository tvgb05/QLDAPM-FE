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

type TopicStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface Topic {
  vi: string;
  en: string;
  desc: string;
  status: TopicStatus;
}

interface Member {
  id: string;
  name: string;
  leader: boolean;
}

@Component({
  selector: 'app-topic-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, AppHeaderComponent, ProjectTimelineComponent],
  templateUrl: './topic-registration.component.html',
})
export class TopicRegistrationComponent implements OnInit {
  @Input() hideLayout = false;
  role: AppRole = 'student';
  private currentUserName = 'Nguyễn Văn A';
  private currentUserId: string | null = null;
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
  readonly icons = APP_ICONS;

  topic: Topic = {
    vi: '',
    en: '',
    desc: '',
    status: 'draft',
  };

  members: Member[] = [];
  rejectReason = '';
  lecturerName = 'TS. Nguyễn Văn A';
  lecturerEmail = 'nguyenvana@hcmut.edu.vn';
  deadline = '28/02/2026';

  // File attachment
  attachedFiles: File[] = [];
  isDragging = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly projectManagementService: ProjectManagementService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getCurrentRole();

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserName =
        currentUser.fullName?.trim() || currentUser.userName?.trim() || this.currentUserName;
      this.currentUserId = currentUser.id;
    }

    this.loadPageData();
  }

  get userName(): string {
    return this.currentUserName;
  }

  get userBadge(): string {
    return this.role === 'lecturer' ? 'GV' : 'SV';
  }

  get lecturerInitials(): string {
    // Strip prefix like "TS. ", "PGS. ", "GS. "
    const cleaned = this.lecturerName.replace(/^(TS\.|PGS\.|GS\.|ThS\.)\s*/i, '').trim();
    const parts = cleaned.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return cleaned.substring(0, 2).toUpperCase();
  }

  get isEditable(): boolean {
    return this.topic.status === 'draft' || this.topic.status === 'rejected';
  }

  get submitButtonLabel(): string {
    if (this.savingTopic) return 'Đang lưu...';
    if (this.topic.status === 'rejected') return 'Cập nhật & Gửi lại';
    if (this.topic.status === 'pending') return 'Đã gửi đi';
    return 'Gửi duyệt';
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

  memberInitial(member: Member): string {
    const name = member.name.trim();
    const lastSpaceIdx = name.lastIndexOf(' ');
    return lastSpaceIdx >= 0 ? name.charAt(lastSpaceIdx + 1) : name.charAt(0);
  }

  isCurrentUser(member: Member): boolean {
    return member.id === this.studentId || member.name === this.currentUserName;
  }

  // ===== File Attachment =====

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  removeFile(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  private addFiles(files: File[]): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > maxSize) {
        this.addNotification(`Tệp "${file.name}" vượt quá 10MB.`);
        continue;
      }
      // Avoid duplicates
      if (!this.attachedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.attachedFiles.push(file);
      }
    }
  }

  // ===== Submit =====

  submitTopic(): void {
    if (!this.topic.vi.trim()) {
      this.addNotification('Vui lòng nhập tên đề tài (Tiếng Việt).');
      return;
    }

    if (this.topicId) {
      // Update existing topic
      this.savingTopic = true;
      this.projectManagementService
        .updateTopic(this.topicId, {
          title: this.topic.vi,
          description: this.topic.desc,
          status: 1, // Set status back to pending
        })
        .pipe(finalize(() => (this.savingTopic = false)))
        .subscribe({
          next: () => {
            this.topic.status = 'pending';
            this.addNotification('Đề tài đã được cập nhật và gửi lại thành công.');
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
        'Thiếu thông tin nhóm hoặc giảng viên để tạo đề tài.'
      );
      return;
    }

    // Create new topic
    this.savingTopic = true;
    this.projectManagementService
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
          this.addNotification('Đề tài đã được tạo và gửi duyệt thành công.');
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tạo đề tài.'
          );
        },
      });
  }

  private mapApiStatusToLocal(status: number): TopicStatus {
    switch (status) {
      case 1: return 'pending';
      case 2: return 'approved';
      case 3: return 'rejected';
      default: return 'draft';
    }
  }

  private loadPageData(): void {
    this.loadingData = true;
    this.teamId = this.route.snapshot.queryParamMap.get('teamId');
    this.topicId = this.route.snapshot.queryParamMap.get('topicId');
    this.teacherId = this.route.snapshot.queryParamMap.get('teacherId');

    this.projectManagementService
      .loadTimeline()
      .pipe(finalize(() => (this.loadingData = false)))
      .subscribe({
        next: (timeline) => {
          this.timeline = timeline;
        },
      });

    this.projectManagementService.loadStudentContext(this.authService.getCurrentUser()).subscribe({
      next: (context) => {
        this.studentId = context.studentId;
        this.projectPeriodId = context.projectPeriodId;
      },
    });

    if (this.teamId) {
      this.projectManagementService.getTeam(this.teamId).subscribe({
        next: (response) => {
          const team = response.data;
          if (!team) {
            return;
          }
          this.projectPeriodId = team.projectPeriodId || this.projectPeriodId;
          if (team.projectTopicId) {
            this.topicId = team.projectTopicId;
            this.loadTopicDetails(this.topicId!);
          }
        },
      });
    }

    if (this.topicId) {
      this.loadTopicDetails(this.topicId);
    }

    if (this.teacherId) {
      this.loadLecturerInfo(this.teacherId);
    }

    // Load mock members (API doesn't have team-member details endpoint)
    if (!this.members.length) {
      this.members = [
        { id: '2011001', name: 'Nguyễn Văn A', leader: true },
        { id: '2011002', name: 'Trần Thị B', leader: false },
        { id: '2011003', name: 'Lê Văn C', leader: false },
      ];
    }
  }

  private loadTopicDetails(topicId: string): void {
    this.projectManagementService.getTopic(topicId).subscribe({
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
        this.topic.status = this.mapApiStatusToLocal(topic.status);

        if (this.teacherId) {
          this.loadLecturerInfo(this.teacherId);
        }
      },
      error: (error: { message?: string; error?: { message?: string | null } }) => {
        this.addNotification(
          error.error?.message ?? error.message ?? 'Không thể tải chi tiết đề tài.'
        );
      },
    });
  }

  private loadLecturerInfo(lecturerId: string): void {
    this.projectManagementService.getLecturer(lecturerId).subscribe({
      next: (response) => {
        const lecturer = response.data;
        if (lecturer) {
          this.lecturerName = lecturer.fullName?.trim() || this.lecturerName;
        }
      },
    });
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
