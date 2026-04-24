import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';
import { AuthService } from '../../shared/services/auth.service';
import { LecturerRegistrationCardComponent } from './components/lecturer-registration-card.component';
import { LecturerRequestCardComponent } from './components/lecturer-request-card.component';
import {
  SelectionTab,
  GroupItem,
  RegistrationCreateRequest,
  RegistrationItem,
  RegistrationUpdateRequest,
} from './lecturer-selection.models';
import { LecturerSelectionService } from './services/lecturer-selection.service';

@Component({
  selector: 'app-lecturer-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AppHeaderComponent,
    ProjectTimelineComponent,
    LecturerRegistrationCardComponent,
    LecturerRequestCardComponent,
  ],
  templateUrl: './lecturer-selection.component.html',
})
export class LecturerSelectionComponent implements OnInit {
  @Input() hideLayout = false;
  role: AppRole = 'student';
  private currentUserName = 'Nguyễn Văn A';
  private studentId: string | null = null;
  private projectPeriodId: string | null = null;
  private selectedMajorId: number | null = null;
  private existingRegistrationId: string | null = null;
  private currentLecturerId: string | null = null;
  private readonly registrationStatusValues = {
    approved: null as number | null,
    rejected: null as number | null,
  };

  showNotifications = false;
  loadingStudentData = false;
  loadingLecturerData = false;
  savingRegistrationId: string | null = null;
  reviewingRegistrationId: string | null = null;
  notifications: NotificationItem[] = [];
  activeTab: SelectionTab = 'pending';
  searchTerm = '';
  readonly icons = APP_ICONS;

  timeline: TimelineStep[] = [];
  studentRegistrations: RegistrationItem[] = [];
  pendingGroups: GroupItem[] = [];
  acceptedGroups: GroupItem[] = [];
  currentMajorTag = '--';
  currentMajorName = 'Chưa xác định chuyên ngành';

  constructor(
    private readonly authService: AuthService,
    private readonly lecturerSelectionService: LecturerSelectionService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getCurrentRole();
    this.loadTimeline();

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserName =
        currentUser.fullName?.trim() || currentUser.userName?.trim() || this.currentUserName;
    }

    if (this.role === 'student') {
      this.loadStudentData();
      return;
    }

    this.loadLecturerData();
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
    if (item.full || this.savingRegistrationId) {
      return;
    }

    if (!this.studentId || !this.projectPeriodId || this.selectedMajorId == null) {
      this.addNotification(
        'Chưa đủ dữ liệu sinh viên hoặc chuyên ngành để gửi đăng ký GVHD.'
      );
      return;
    }

    if (this.existingRegistrationId && !item.registered) {
      this.addNotification(
        'Bạn đã có đăng ký trước đó. Hiện chưa hỗ trợ thay đổi nguyện vọng.'
      );
      return;
    }

    if (item.registered) {
      this.clearRegisteredLecturer();
      this.addNotification(`Đã hủy đăng ký với GVHD <b>${item.lecturer}</b>.`);
      return;
    }

    const payload: RegistrationCreateRequest = {
      studentId: this.studentId,
      projectPeriodId: this.projectPeriodId,
      selectedMajorId: this.selectedMajorId,
      choices: [
        {
          lecturerId: item.id,
          priorityOrder: 1,
        },
      ],
    };

    this.savingRegistrationId = item.id;
    this.lecturerSelectionService
      .saveRegistration(payload)
      .pipe(finalize(() => (this.savingRegistrationId = null)))
      .subscribe({
        next: (response) => {
          this.existingRegistrationId = response.data?.id ?? this.existingRegistrationId;
          this.setRegisteredLecturer(item.id);
          this.addNotification(`Đăng ký thành công GVHD <b>${item.lecturer}</b>.`);
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? `Không thể đăng ký GVHD <b>${item.lecturer}</b>.`
          );
        },
      });
  }

  switchLecturerTab(tab: SelectionTab): void {
    this.activeTab = tab;
  }

  approveAll(): void {
    for (const group of this.pendingGroups.filter((item) => item.decision === 'none')) {
      this.handleLecturerAction(group, 'approve');
    }
  }

  handleLecturerAction(group: GroupItem, action: 'approve' | 'reject'): void {
    if (!group.registrationId) {
      this.addNotification('Không tìm thấy mã đăng ký để thực hiện thao tác.');
      return;
    }

    const status =
      action === 'approve'
        ? this.registrationStatusValues.approved
        : this.registrationStatusValues.rejected;

    if (status == null) {
      this.addNotification(
        'Tính năng duyệt/từ chối hiện đang được cấu hình thêm thông số status.'
      );
      return;
    }

    const payload: RegistrationUpdateRequest = {
      status,
      approvedLecturerId: action === 'approve' ? this.currentLecturerId : null,
      rejectReason: action === 'reject' ? 'Từ chối bởi giảng viên.' : null,
    };

    this.reviewingRegistrationId = group.registrationId;
    this.lecturerSelectionService
      .updateRegistration(group.registrationId, payload)
      .pipe(finalize(() => (this.reviewingRegistrationId = null)))
      .subscribe({
        next: () => {
          this.lecturerSelectionService
            .createReviewHistory(
              group.registrationId!,
              this.authService.getCurrentUser()?.id ?? null,
              payload.rejectReason ?? null
            )
            .subscribe({
              error: () => {
                this.addNotification('Đã cập nhật review nhưng không ghi được lịch sử.');
              },
            });

          if (action === 'approve') {
            group.decision = 'approved';
            this.pendingGroups = this.pendingGroups.filter((item) => item !== group);
            this.acceptedGroups = [...this.acceptedGroups, group];
            this.addNotification(`Bạn đã duyệt yêu cầu của <b>${group.name}</b>.`);
            return;
          }

          group.decision = 'rejected';
          this.pendingGroups = this.pendingGroups.filter((item) => item !== group);
          this.addNotification(`Bạn đã từ chối yêu cầu của <b>${group.name}</b>.`);
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? `Không thể cập nhật cho <b>${group.name}</b>.`
          );
        },
      });
  }

  trackRegistration(_index: number, item: RegistrationItem): string {
    return item.id;
  }

  trackGroup(_index: number, item: GroupItem): string {
    return item.registrationId ?? item.studentId;
  }

  private loadStudentData(): void {
    this.loadingStudentData = true;
    this.lecturerSelectionService
      .loadStudentContext(this.authService.getCurrentUser())
      .pipe(finalize(() => (this.loadingStudentData = false)))
      .subscribe({
        next: (result) => {
          this.timeline = result.timeline;
          this.studentRegistrations = result.registrations;
          this.studentId = result.studentId;
          this.projectPeriodId = result.projectPeriodId;
          this.selectedMajorId = result.selectedMajorId;
          this.existingRegistrationId = result.existingRegistrationId;
          this.currentMajorName = result.currentMajorName ?? this.currentMajorName;
          this.currentMajorTag = result.currentMajorTag ?? this.currentMajorTag;
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tải dữ liệu chọn giảng viên.'
          );
        },
      });
  }

  private loadLecturerData(): void {
    this.loadingLecturerData = true;
    this.lecturerSelectionService
      .loadLecturerContext(this.authService.getCurrentUser())
      .pipe(finalize(() => (this.loadingLecturerData = false)))
      .subscribe({
        next: (result) => {
          this.timeline = result.timeline;
          this.pendingGroups = result.pendingGroups;
          this.acceptedGroups = result.acceptedGroups;
          this.currentLecturerId = result.currentLecturerId;
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tải danh sách đăng ký cho giảng viên.'
          );
        },
      });
  }

  private loadTimeline(): void {
    this.lecturerSelectionService.loadTimeline().subscribe({
      next: (timeline) => {
        this.timeline = timeline;
      },
      error: () => {
        this.addNotification('Không thể tải lộ trình đồ án.');
      },
    });
  }

  private setRegisteredLecturer(lecturerId: string): void {
    this.studentRegistrations = this.studentRegistrations.map((item) => ({
      ...item,
      registered: item.id === lecturerId,
    }));
  }

  private clearRegisteredLecturer(): void {
    this.studentRegistrations = this.studentRegistrations.map((item) => ({
      ...item,
      registered: false,
    }));
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
