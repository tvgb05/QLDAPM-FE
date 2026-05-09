import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { finalize, map } from 'rxjs';

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
  RegistrationItem,
  SupervisorApproveRequest,
  SupervisorRejectRequest,
  StudentResponse,
  LecturerResponse,
} from './lecturer-selection.models';
import { LecturerSelectionService } from './services/lecturer-selection.service';

@Component({
  selector: 'app-lecturer-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    RouterModule,
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
  currentUserName = 'Nguyễn Văn A';
  studentId: string | null = null;
  projectPeriodId: string | null = null;
  selectedMajorId: number | null = null;
  existingRegistrationId: string | null = null;
  currentLecturerId: string | null = null;

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
  majors: any[] = [];
  filterMajorId: number | null = null;

  /** Registration status: null = chưa đăng ký, 0 = pending, 1 = approved, 2 = rejected */
  registrationStatus: number | null = null;
  registrationRejectReason: string | null = null;
  registeredLecturerId: string | null = null;
  approvedLecturerName: string | null = null;

  /** Admin reject modal */
  showRejectModal = false;
  rejectRegistrationId: string | null = null;
  rejectReasonInput = '';

  /** Admin approve modal */
  showApproveModal = false;
  approveRegistrationId: string | null = null;
  approveGroup: GroupItem | null = null;
  constructor(
    private readonly authService: AuthService,
    private readonly lecturerSelectionService: LecturerSelectionService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Lấy vai trò hiện tại
    this.role = this.authService.getCurrentRole();
    
    // 2. Tải lộ trình chung
    this.loadTimeline();

    // 3. Cập nhật thông tin user
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserName =
        currentUser.fullName?.trim() || currentUser.userName?.trim() || this.currentUserName;
    }

    // 4. Thiết lập tab mặc định cho GV/PĐT
    if (this.role === 'lecturer' || this.role === 'pdt') {
      this.activeTab = 'pending';
    }

    // 5. Kích hoạt load data tùy theo role
    if (this.role === 'student') {
      this.loadStudentData();
    } else {
      this.loadLecturerData();
    }
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

  get filteredRegistrations(): RegistrationItem[] {
    const keyword = this.searchTerm.trim().toLowerCase();
    if (!keyword) {
      return this.studentRegistrations;
    }

    return this.studentRegistrations.filter((item) =>
      [item.lecturer, item.tag, item.specialty].some((value) => value.toLowerCase().includes(keyword))
    );
  }

  get statusLabel(): string {
    if (this.registrationStatus === 1 && this.approvedLecturerName) return 'Đã phê duyệt';
    if (this.registrationStatus === 2) return 'Bị từ chối';
    if (this.registeredLecturerId !== null) return 'Đang chờ duyệt';
    return 'Chưa đăng ký';
  }

  get statusClass(): string {
    if (this.registrationStatus === 1 && this.approvedLecturerName) return 'bg-green-100 text-green-700';
    if (this.registrationStatus === 2) return 'bg-red-100 text-red-700';
    if (this.registeredLecturerId !== null) return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  }

  get statusIconClass(): string {
    if (this.registrationStatus === 1 && this.approvedLecturerName) return 'text-green-600';
    if (this.registrationStatus === 2) return 'text-red-600';
    if (this.registeredLecturerId !== null) return 'text-amber-600';
    return 'text-slate-600';
  }

  get canRegister(): boolean {
    // Can register if no lecturer is selected yet, or if previous registration was rejected
    return this.registeredLecturerId === null || this.registrationStatus === 2;
  }

  get showStatusBanner(): boolean {
    // Show banner if there's an existing registration (pending/approved) or a rejection
    return this.registeredLecturerId !== null || this.registrationStatus === 1 || this.registrationStatus === 2;
  }

  get userBadge(): string {
    return this.role === 'student' ? 'SV' : this.role === 'lecturer' ? 'GV' : 'PĐT';
  }

  get pageTitle(): string {
    return this.role === 'student' ? 'Chọn giảng viên' : 'Đăng ký Hướng dẫn';
  }

  get userName(): string {
    return this.currentUserName;
  }

  get pendingCount(): number {
    return this.pendingGroups.length;
  }

  get acceptedCount(): number {
    return this.acceptedGroups.length;
  }

  toggleRegister(item: RegistrationItem): void {
    if (item.full || this.savingRegistrationId) {
      return;
    }

    // Nếu người dùng nhấn vào giảng viên đang được đăng ký (Chờ duyệt) -> thực hiện hủy
    if (item.id === this.registeredLecturerId && this.registrationStatus === 0) {
      this.cancelRegistration();
      return;
    }

    if (!this.canRegister) {
      if (this.registrationStatus === 0) {
        this.addNotification('Bạn đã có đăng ký GVHD đang chờ duyệt. Vui lòng đợi kết quả.');
      } else if (this.registrationStatus === 1) {
        this.addNotification('Đăng ký GVHD của bạn đã được phê duyệt.');
      }
      return;
    }

    if (!this.studentId || !this.projectPeriodId || this.selectedMajorId == null) {
      this.addNotification(
        'Chưa đủ dữ liệu sinh viên hoặc chuyên ngành để gửi đăng ký GVHD.'
      );
      return;
    }

    this.savingRegistrationId = item.id;
    this.lecturerSelectionService
      .registerSupervisor({ lecturerId: item.id })
      .pipe(finalize(() => (this.savingRegistrationId = null)))
      .subscribe({
        next: (response) => {
          this.existingRegistrationId = response.data?.id ?? this.existingRegistrationId;
          this.registrationStatus = 0; // Pending
          this.registeredLecturerId = item.id;
          this.registrationRejectReason = null;
          
          // Tải lại toàn bộ context để đồng bộ UI
          this.loadStudentData();
          
          this.addNotification(`Đăng ký thành công GVHD <b>${item.lecturer}</b>. Đang chờ phê duyệt.`);
          this.cdr.detectChanges();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? `Không thể đăng ký GVHD <b>${item.lecturer}</b>.`
          );
        },
      });
  }

  cancelRegistration(): void {
    if (!this.existingRegistrationId || this.savingRegistrationId) return;

    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký giáo viên hướng dẫn này?')) return;

    this.savingRegistrationId = 'cancelling';
    this.lecturerSelectionService
      .cancelSupervisorRegistration(this.existingRegistrationId)
      .pipe(finalize(() => (this.savingRegistrationId = null)))
      .subscribe({
        next: () => {
          this.registrationStatus = null;
          this.registeredLecturerId = null;
          this.existingRegistrationId = null;
          this.approvedLecturerName = null;
          
          // Tải lại toàn bộ context để đồng bộ UI
          this.loadStudentData();
          
          this.addNotification('Đã hủy đăng ký GVHD thành công.');
          this.cdr.detectChanges();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể hủy đăng ký GVHD.'
          );
        },
      });
  }

  switchLecturerTab(tab: SelectionTab): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
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

    if (action === 'reject') {
      this.rejectRegistrationId = group.registrationId;
      this.rejectReasonInput = '';
      this.showRejectModal = true;
      return;
    }

    if (action === 'approve') {
      this.approveRegistrationId = group.registrationId;
      this.approveGroup = group;
      this.showApproveModal = true;
      return;
    }
  }

  confirmApprove(): void {
    if (!this.approveRegistrationId || !this.approveGroup) return;

    const group = this.approveGroup;
    const lecturerId = group.choices?.[0]?.lecturerId;
    if (!lecturerId) {
      this.addNotification('Sinh viên chưa chọn giảng viên. Không thể phê duyệt.');
      this.showApproveModal = false;
      return;
    }

    const payload: SupervisorApproveRequest = { approvedLecturerId: lecturerId };

    this.reviewingRegistrationId = this.approveRegistrationId;
    this.lecturerSelectionService
      .approveSupervisorRegistration(this.approveRegistrationId, payload)
      .pipe(finalize(() => {
        this.reviewingRegistrationId = null;
        this.showApproveModal = false;
        this.approveRegistrationId = null;
        this.approveGroup = null;
      }))
      .subscribe({
        next: () => {
          group.decision = 'approved';
          this.pendingGroups = this.pendingGroups.filter((item) => item !== group);
          this.acceptedGroups = [...this.acceptedGroups, group];
          this.addNotification(`Đã phê duyệt đăng ký GVHD của <b>${group.name}</b>.`);
          
          // Tải lại dữ liệu để đảm bảo đồng bộ
          this.loadLecturerData();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? `Không thể phê duyệt cho <b>${group.name}</b>.`
          );
        },
      });
  }

  confirmReject(): void {
    if (!this.rejectRegistrationId) return;

    const group = this.pendingGroups.find((g) => g.registrationId === this.rejectRegistrationId);
    if (!group) {
      this.showRejectModal = false;
      return;
    }

    const payload: SupervisorRejectRequest = {
      rejectReason: this.rejectReasonInput.trim() || 'Bị từ chối bởi Phòng Đào tạo.',
    };

    this.reviewingRegistrationId = this.rejectRegistrationId;
    this.lecturerSelectionService
      .rejectSupervisorRegistration(this.rejectRegistrationId, payload)
      .pipe(finalize(() => {
        this.reviewingRegistrationId = null;
        this.showRejectModal = false;
        this.rejectRegistrationId = null;
        this.rejectReasonInput = '';
      }))
      .subscribe({
        next: () => {
          group.decision = 'rejected';
          this.pendingGroups = this.pendingGroups.filter((item) => item !== group);
          this.addNotification(`Đã từ chối đăng ký GVHD của <b>${group.name}</b>.`);

          // Tải lại dữ liệu để đảm bảo đồng bộ
          this.loadLecturerData();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ?? error.message ?? `Không thể từ chối cho <b>${group.name}</b>.`
          );
        },
      });
  }

  cancelReject(): void {
    this.showRejectModal = false;
    this.rejectRegistrationId = null;
    this.rejectReasonInput = '';
  }

  cancelApprove(): void {
    this.showApproveModal = false;
    this.approveRegistrationId = null;
    this.approveGroup = null;
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
        next: (result: any) => {
          this.timeline = result.timeline;
          this.studentRegistrations = result.registrations;
          this.studentId = result.studentId;
          this.projectPeriodId = result.projectPeriodId;
          this.selectedMajorId = result.selectedMajorId;
          this.existingRegistrationId = result.existingRegistrationId;
          this.currentMajorName = result.currentMajorName ?? this.currentMajorName;
          this.currentMajorTag = result.currentMajorTag ?? this.currentMajorTag;
          this.registrationStatus = result.registrationStatus;
          this.registrationRejectReason = result.registrationRejectReason;
          this.registeredLecturerId = result.registeredLecturerId;
          this.approvedLecturerName = result.approvedLecturerName;
          this.majors = result.majors || [];
          this.filterMajorId = result.selectedMajorId;
          this.cdr.detectChanges();
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
    this.cdr.detectChanges(); // Force show loading spinner

    this.lecturerSelectionService
      .loadLecturerContext(this.authService.getCurrentUser())
      .pipe(
        finalize(() => {
          this.loadingLecturerData = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          this.timeline = result.timeline;
          this.pendingGroups = result.pendingGroups || [];
          this.acceptedGroups = result.acceptedGroups || [];
          this.currentLecturerId = result.currentLecturerId;
          
          // Đảm bảo UI được cập nhật sau khi có dữ liệu
          this.cdr.detectChanges();
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

  private setRegisteredLecturer(lecturerId: string | null): void {
    this.studentRegistrations = this.studentRegistrations.map((item) => {
      const isTargetLecturer = item.id === lecturerId;
      // Chỉ đánh dấu registered (để hiện nút Hủy) nếu status là Pending (0) hoặc Approved (1)
      // Nếu đã bị Reject (2), nút phải hiện là "Đăng ký"
      const isRegistered = isTargetLecturer && (this.registrationStatus === 0 || this.registrationStatus === 1);
      
      return {
        ...item,
        registered: isRegistered,
        status: isTargetLecturer ? this.registrationStatus : null
      };
    });
    this.cdr.detectChanges();
  }

  onMajorFilterChange(majorId: number | string): void {
    const id = typeof majorId === 'string' ? parseInt(majorId, 10) : majorId;
    this.filterMajorId = id || null;
    this.loadingLecturerData = true;
    
    this.lecturerSelectionService.getLecturersByMajor(this.filterMajorId)
      .pipe(finalize(() => this.loadingLecturerData = false))
      .subscribe({
        next: (result) => {
          this.studentRegistrations = [...result.registrations];
          if (this.registeredLecturerId) {
            this.setRegisteredLecturer(this.registeredLecturerId);
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.addNotification('Không thể tải danh sách giảng viên cho chuyên ngành này.');
        }
      });
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
