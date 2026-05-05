import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';
import { AuthService } from '../../shared/services/auth.service';
import { ProjectManagementService } from '../project-management/services/project-management.service';
import { ProjectTopicResponse } from '../project-management/project-management.models';
import { APP_ICONS } from '../../shared/icons/app-icons';

type TopicStatusLabel = 'draft' | 'pending' | 'approved' | 'rejected';

interface GroupCardItem {
  teamId: string;
  teamName: string;
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  status: TopicStatusLabel;
  members: GroupMember[];
  rejectReason: string;
  createdDate?: string;
}

interface GroupMember {
  id: string;
  name: string;
  code: string;
  leader: boolean;
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
  private currentUserName = 'TS. Giảng Viên A';
  private lecturerId: string | null = null;
  showNotifications = false;
  notifications: NotificationItem[] = [];
  timeline: TimelineStep[] = [];
  loadingData = false;
  readonly icons = APP_ICONS;

  groups: GroupCardItem[] = [];
  filteredGroups: GroupCardItem[] = [];
  searchTerm = '';

  // Detail modal
  detailModalOpen = false;
  selectedGroup: GroupCardItem | null = null;

  // Reject modal
  rejectModalOpen = false;
  rejectReason = '';
  processingAction = false;

  // Milestones (UI only)
  milestonesExpanded = true;

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

  toggleMilestones(): void {
    this.milestonesExpanded = !this.milestonesExpanded;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = this.groups;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      list = list.filter(g =>
        g.teamName.toLowerCase().includes(term) ||
        g.topicTitle.toLowerCase().includes(term)
      );
    }
    this.filteredGroups = list;
  }

  openDetailModal(group: GroupCardItem): void {
    this.selectedGroup = group;
    this.detailModalOpen = true;
  }

  closeDetailModal(): void {
    this.detailModalOpen = false;
    this.selectedGroup = null;
  }

  openRejectModal(): void {
    this.rejectReason = '';
    this.rejectModalOpen = true;
  }

  closeRejectModal(): void {
    this.rejectModalOpen = false;
    this.rejectReason = '';
  }

  approveTopic(): void {
    if (!this.selectedGroup) return;
    this.processingAction = true;

    this.projectManagementService
      .updateTopic(this.selectedGroup.topicId, { status: 2 })
      .pipe(finalize(() => (this.processingAction = false)))
      .subscribe({
        next: () => {
          if (this.selectedGroup) {
            this.selectedGroup.status = 'approved';
            this.addNotification(`Bạn đã duyệt đề tài cho ${this.selectedGroup.teamName}.`);
          }
          this.applyFilters();
          this.closeDetailModal();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể duyệt đề tài.'
          );
        },
      });
  }

  confirmReject(): void {
    if (!this.selectedGroup) return;
    this.processingAction = true;

    this.projectManagementService
      .updateTopic(this.selectedGroup.topicId, {
        status: 3,
        description: this.rejectReason || undefined,
      })
      .pipe(finalize(() => (this.processingAction = false)))
      .subscribe({
        next: () => {
          if (this.selectedGroup) {
            this.selectedGroup.status = 'rejected';
            this.selectedGroup.rejectReason = this.rejectReason;
            this.addNotification(`Đã gửi yêu cầu chỉnh sửa đề tài cho ${this.selectedGroup.teamName}.`);
          }
          this.applyFilters();
          this.closeRejectModal();
          this.closeDetailModal();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể từ chối đề tài.'
          );
        },
      });
  }

  memberInitial(member: GroupMember): string {
    const name = member.name.trim();
    const lastSpaceIdx = name.lastIndexOf(' ');
    return lastSpaceIdx >= 0 ? name.charAt(lastSpaceIdx + 1) : name.charAt(0);
  }

  private mapApiStatusToLocal(status: number): TopicStatusLabel {
    switch (status) {
      case 1: return 'pending';
      case 2: return 'approved';
      case 3: return 'rejected';
      default: return 'draft';
    }
  }

  private loadPageData(): void {
    this.loadingData = true;

    this.projectManagementService
      .loadTimeline()
      .subscribe({
        next: (timeline) => {
          this.timeline = timeline;
        },
      });

    this.projectManagementService.loadLecturerContext(this.authService.getCurrentUser()).subscribe({
      next: (context) => {
        this.lecturerId = context.lecturerId;
        this.loadTopicsAndTeams();
      },
      error: () => {
        this.loadTopicsAndTeams();
      },
    });
  }

  private loadTopicsAndTeams(): void {
    this.projectManagementService.listAllTopics()
      .pipe(finalize(() => (this.loadingData = false)))
      .subscribe({
        next: (response) => {
          const topics = response.data ?? [];

          // Filter topics by current lecturer if available
          const relevantTopics = this.lecturerId
            ? topics.filter(t => t.teacherId === this.lecturerId)
            : topics;

          this.buildGroupCards(relevantTopics);
        },
        error: () => {
          // Fallback: load mock data for development
          this.groups = [
            {
              teamId: '05', teamName: 'Nhóm 05 - Team Coder', topicId: 't1',
              topicTitle: 'Xây dựng hệ thống Microservices cho sàn TMĐT',
              topicDescription: 'Nghiên cứu kiến trúc Microservices, sử dụng NestJS, Kafka và Docker...',
              status: 'pending', rejectReason: '',
              members: [
                { id: 's1', name: 'Nguyễn Văn A', code: '2011001', leader: true },
                { id: 's2', name: 'Trần Thị B', code: '2011002', leader: false },
                { id: 's3', name: 'Lê Văn C', code: '2011003', leader: false },
              ],
            },
            {
              teamId: '02', teamName: 'Nhóm 02 - AI Chatbot', topicId: 't2',
              topicTitle: 'Chatbot tư vấn tuyển sinh sử dụng RAG',
              topicDescription: 'Sử dụng framework LangChain, Vector DB (Pinecone) và model OpenAI để tư vấn.',
              status: 'approved', rejectReason: '',
              members: [
                { id: 's4', name: 'Phạm Văn D', code: '2011004', leader: true },
                { id: 's5', name: 'Hoàng Thị E', code: '2011005', leader: false },
              ],
            },
            {
              teamId: '08', teamName: 'Nhóm 08 - Web App', topicId: 't3',
              topicTitle: '', topicDescription: '',
              status: 'draft', rejectReason: '',
              members: [
                { id: 's6', name: 'Lý Quốc F', code: '2011006', leader: true },
                { id: 's7', name: 'Trịnh Văn G', code: '2011007', leader: false },
              ],
            },
          ];
          this.applyFilters();
        },
      });
  }

  private buildGroupCards(topics: ProjectTopicResponse[]): void {
    this.groups = topics.map(topic => ({
      teamId: topic.projectTeamId,
      teamName: `Nhóm ${topic.projectTeamId.substring(0, 6)}`,
      topicId: topic.id,
      topicTitle: topic.title?.trim() || '',
      topicDescription: topic.description?.trim() || '',
      status: this.mapApiStatusToLocal(topic.status),
      rejectReason: '',
      members: [],
      createdDate: topic.createdDate
        ? new Date(topic.createdDate).toLocaleDateString('vi-VN')
        : undefined,
    }));

    // Load team names for each group
    for (const group of this.groups) {
      this.projectManagementService.getTeam(group.teamId).subscribe({
        next: (response) => {
          if (response.data?.teamName) {
            group.teamName = response.data.teamName;
          }
        },
      });
    }

    this.applyFilters();
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
