import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';
import { AuthService } from '../../shared/services/auth.service';
import { Gd2RegistrationCardComponent } from './components/gd2-registration-card.component';
import { Gd2RequestCardComponent } from './components/gd2-request-card.component';
import {
  Gd2Tab,
  GroupItem,
  RegistrationCreateRequest,
  RegistrationItem,
  RegistrationUpdateRequest,
} from './gd2.models';
import { Gd2Service } from './services/gd2.service';

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
export class Gd2Component implements OnInit {
  role: AppRole = 'student';
  private currentUserName = 'Nguyễn Văn A';
  private studentId: string | null = null;
  private projectPeriodId: string | null = null;
  private selectedMajorId: number | null = null;
  private existingRegistrationId: string | null = null;
  private currentLecturerId: string | null = null;
  private readonly registrationStatusValues = {
    // TODO: confirm exact numeric enum values for approve/reject from backend.
    approved: null as number | null,
    rejected: null as number | null,
  };

  showNotifications = false;
  loadingStudentData = false;
  loadingLecturerData = false;
  savingRegistrationId: string | null = null;
  reviewingRegistrationId: string | null = null;
  notifications: NotificationItem[] = [];
  activeTab: Gd2Tab = 'pending';
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
    private readonly gd2Service: Gd2Service
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
        'Chưa đủ dữ liệu sinh viên hoặc chuyên ngành để gửi đăng ký GVHD lên backend.'
      );
      return;
    }

    if (this.existingRegistrationId && !item.registered) {
      this.addNotification(
        'TODO: Đã có registrationId, nhưng swagger của PUT /api/StudentProjectRegistration/{id} không nhận choices lecturer. Mình không đoán workflow update để tránh gửi sai payload.'
      );
      return;
    }

    if (item.registered) {
      this.clearRegisteredLecturer();
      this.addNotification(`Đã hủy đăng ký cục bộ với GVHD <b>${item.lecturer}</b>.`);
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
    this.gd2Service
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

  switchLecturerTab(tab: Gd2Tab): void {
    this.activeTab = tab;
  }

  approveAll(): void {
    for (const group of this.pendingGroups.filter((item) => item.decision === 'none')) {
      this.handleLecturerAction(group, 'approve');
    }
  }

  handleLecturerAction(group: GroupItem, action: 'approve' | 'reject'): void {
    if (!group.registrationId) {
      this.addNotification('TODO: Không tìm thấy registrationId để gửi review lên backend.');
      return;
    }

    const status =
      action === 'approve'
        ? this.registrationStatusValues.approved
        : this.registrationStatusValues.rejected;

    if (status == null) {
      this.addNotification(
        'TODO: Swagger chưa nêu rõ status enum cho approve/reject, nên mình chưa gửi PUT để tránh sai dữ liệu.'
      );
      return;
    }

    const payload: RegistrationUpdateRequest = {
      status,
      approvedLecturerId: action === 'approve' ? this.currentLecturerId : null,
      rejectReason: action === 'reject' ? 'TODO: UI hiện chưa có modal nhập lý do từ chối.' : null,
    };

    this.reviewingRegistrationId = group.registrationId;
    this.gd2Service
      .updateRegistration(group.registrationId, payload)
      .pipe(finalize(() => (this.reviewingRegistrationId = null)))
      .subscribe({
        next: () => {
          this.gd2Service
            .createReviewHistory(
              group.registrationId!,
              this.authService.getCurrentUser()?.id ?? null,
              payload.rejectReason ?? null
            )
            .subscribe({
              error: () => {
                this.addNotification('Đã cập nhật review nhưng không ghi được review history.');
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
            error.error?.message ?? error.message ?? `Không thể cập nhật review cho <b>${group.name}</b>.`
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
    this.gd2Service
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

          if (this.existingRegistrationId) {
            this.addNotification(
              'TODO: Đã tìm thấy registrationId hiện có, nhưng swagger paging không trả choices lecturer nên chưa thể khôi phục chính xác lựa chọn cũ.'
            );
          }

          if (!this.studentId) {
            this.addNotification(
              'Backend chưa có AppStudent cho tài khoản này, nên hiện chỉ xem được danh sách giảng viên.'
            );
          }
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tải dữ liệu giai đoạn 2.'
          );
        },
      });
  }

  private loadLecturerData(): void {
    this.loadingLecturerData = true;
    this.gd2Service
      .loadLecturerContext(this.authService.getCurrentUser())
      .pipe(finalize(() => (this.loadingLecturerData = false)))
      .subscribe({
        next: (result) => {
          this.timeline = result.timeline;
          this.pendingGroups = result.pendingGroups;
          this.acceptedGroups = result.acceptedGroups;
          this.currentLecturerId = result.currentLecturerId;

          this.addNotification(
            'TODO: Registration paging không trả lecturer choices, nên lecturer tab hiện đang load danh sách đăng ký Stage 2 chưa lọc theo giảng viên.'
          );
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tải danh sách đăng ký cho giảng viên.'
          );
        },
      });
  }

  private loadTimeline(): void {
    this.gd2Service.loadTimeline().subscribe({
      next: (timeline) => {
        this.timeline = timeline;
      },
      error: () => {
        this.addNotification('Không thể tải lộ trình đồ án cho GD2.');
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
