import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { LecturerAssignmentCardComponent } from './components/lecturer-assignment-card.component';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { ProjectTimelineComponent } from '../../shared/components/project-timeline/project-timeline.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { NotificationItem, TimelineStep } from '../../shared/models/ui.models';
import { LecturerAssignment, Gd1Role, Gd1RegistrationCreateRequest, Specialization } from './gd1.models';
import { AuthService } from '../../shared/services/auth.service';
import { Gd1Service } from './services/gd1.service';

@Component({
  selector: 'app-gd1',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    AppHeaderComponent,
    ProjectTimelineComponent,
    LecturerAssignmentCardComponent,
  ],
  templateUrl: './gd1.component.html',
})
export class Gd1Component {
  readonly icons = APP_ICONS;
  role: Gd1Role = 'student';
  showNotifications = false;
  loadingStudentData = false;
  loadingStudentSelection = false;
  savingSelection = false;
  selectedSpecializationId: string | null = null;
  notifications: NotificationItem[] = [];
  private currentUserName = 'Nguyễn Văn A';
  private studentId: string | null = null;
  private projectPeriodId: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly gd1Service: Gd1Service,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getCurrentRole();

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserName =
        currentUser.fullName?.trim() || currentUser.userName?.trim() || this.currentUserName;
    }

    if (this.role === 'student') {
      this.loadStudentData();
    }
  }

  get userName(): string {
    return this.currentUserName;
  }

  get userBadge(): string {
    return this.role === 'lecturer' ? 'GV' : 'SV';
  }

  timeline: TimelineStep[] = [];

  specializations: Specialization[] = [];

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

  switchRole(_role: Gd1Role): void {
    // Role is driven by login response for now.
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  toggleSelection(target: Specialization): void {
    if (this.loadingStudentData || this.loadingStudentSelection) {
      this.addNotification('Đang đồng bộ dữ liệu sinh viên, vui lòng thử lại sau vài giây.');
      return;
    }
    console.log(this.studentId);

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

    if (!this.projectPeriodId) {
      this.addNotification(
        'Chưa tìm thấy projectPeriodId của Giai đoạn 1 từ backend, nên hiện chưa thể gửi đăng ký.'
      );
      return;
    }

    if (!this.studentId) {
      this.addNotification(
        'Chưa đọc được user id từ phiên đăng nhập hiện tại, nên frontend chưa thể tạo đăng ký Stage 1.'
      );
      return;
    }

    const payload: Gd1RegistrationCreateRequest = {
      studentId: this.studentId,
      projectPeriodId: this.projectPeriodId,
      selectedMajorId: Number(target.id),
      choices: [],
    };

    this.savingSelection = true;
    this.gd1Service
      .saveStudentSpecialization(payload)
      .pipe(finalize(() => (this.savingSelection = false)))
      .subscribe({
        next: () => {
          this.selectedSpecializationId = target.id;
          this.addNotification(`Đăng ký thành công hướng chuyên ngành: ${target.name}`);
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.addNotification(
            error.error?.message ??
              error.message ??
              `Không thể lưu chuyên ngành ${target.name} lên hệ thống.`
          );
        },
      });
  }

  getSpecializationCardClass(item: Specialization): string {
    if (this.selectedSpecializationId === item.id) {
      return 'bg-blue-50 p-6 rounded-2xl border-2 border-blue-500 shadow-md transition group relative overflow-hidden h-full flex flex-col';
    }

    if (this.selectedSpecializationId && this.selectedSpecializationId !== item.id) {
      return 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition group relative overflow-hidden h-full flex flex-col opacity-50 grayscale';
    }

    return 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group relative overflow-hidden h-full flex flex-col';
  }

  getSpecializationButtonClass(item: Specialization): string {
    if (this.selectedSpecializationId === item.id) {
      return 'w-full py-3 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 mt-auto';
    }

    if (this.selectedSpecializationId && this.selectedSpecializationId !== item.id) {
      return 'w-full py-3 rounded-xl text-sm font-bold bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100 flex items-center justify-center gap-2 mt-auto';
    }

    const hoverClass = {
      blue: 'hover:bg-blue-600 hover:text-white',
      orange: 'hover:bg-orange-600 hover:text-white',
      green: 'hover:bg-green-600 hover:text-white',
      purple: 'hover:bg-purple-600 hover:text-white',
    }[item.color];

    return `w-full py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 transition flex items-center justify-center gap-2 mt-auto ${hoverClass}`;
  }

  getSpecializationButtonLabel(item: Specialization): string {
    if (this.selectedSpecializationId === item.id) {
      return 'Đã đăng ký';
    }

    if (this.selectedSpecializationId && this.selectedSpecializationId !== item.id) {
      return 'Không khả dụng';
    }

    return 'Chọn chuyên ngành đồ án';
  }

  getSpecializationIconBadgeClass(item: Specialization): string {
    return {
      blue: 'h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4',
      orange:
        'h-12 w-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4',
      green: 'h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4',
      purple:
        'h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4',
    }[item.color];
  }

  getSpecializationAccentClass(item: Specialization): string {
    return {
      blue: 'w-24 h-24 text-blue-600',
      orange: 'w-24 h-24 text-orange-600',
      green: 'w-24 h-24 text-green-600',
      purple: 'w-24 h-24 text-purple-600',
    }[item.color];
  }

  trackSpecialization(_index: number, item: Specialization): string {
    return item.id;
  }

  trackLecturerAssignment(_index: number, item: LecturerAssignment): string {
    return item.name;
  }

  private loadStudentData(): void {
    this.loadingStudentData = true;
    this.gd1Service
      .loadBaseStudentContext()
      .subscribe({
        next: (result) => {
          this.specializations = result.specializations;
          this.timeline = result.timeline;
          this.projectPeriodId = result.projectPeriodId;
          this.loadingStudentData = false;

          if (!this.projectPeriodId) {
            this.addNotification(
              'Backend chưa trả về project period cho Giai đoạn 1, nên chưa thể gửi đăng ký chuyên ngành.'
            );
          }

          this.loadStudentSelection();
          this.cdr.detectChanges();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.loadingStudentData = false;
          this.addNotification(
            error.error?.message ?? error.message ?? 'Không thể tải dữ liệu giai đoạn 1.'
          );
          this.cdr.detectChanges();
        },
      });
  }

  private loadStudentSelection(): void {
    this.loadingStudentSelection = true;
    this.gd1Service
      .loadStudentSelection(this.authService.getCurrentUser(), this.projectPeriodId)
      .pipe(finalize(() => {
        this.loadingStudentSelection = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (result) => {
          this.studentId = result.studentId;
          this.selectedSpecializationId = result.selectedMajorId;

          if (!result.studentId) {
            this.addNotification(
              'Không đọc được user id từ phiên đăng nhập hiện tại, nên chưa thể gửi đăng ký chuyên ngành.'
            );
          }
        },
        error: () => {
          this.addNotification('Không thể đồng bộ thông tin sinh viên cho Giai đoạn 1.');
        },
      });
  }

  private addNotification(message: string): void {
    this.notifications.unshift({ message });
  }
}
