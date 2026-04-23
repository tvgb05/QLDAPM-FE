import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { PdtTimeService } from '../services/pdt-time.service';
import {
  ProjectPeriodResponse,
  SemesterPublicResponse,
  SemesterCreateRequest,
  SemesterUpdateRequest,
  ProjectPeriodCreateRequest,
  ProjectPeriodUpdateRequest,
  ProjectPeriodType,
} from '../pdt-time.models';
import { NotificationItem } from '../../../shared/models/ui.models';

@Component({
  selector: 'app-pdt-time-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './pdt-time-tab.component.html',
  styleUrl: './pdt-time-tab.component.css'
})
export class PdtTimeTabComponent implements OnInit {
  @Output() notify = new EventEmitter<NotificationItem>();

  readonly icons = APP_ICONS;
  readonly ProjectPeriodType = ProjectPeriodType;

  readonly periodTypes = [
    { value: ProjectPeriodType.MajorSelection, name: 'Chọn hướng chuyên ngành' },
    { value: ProjectPeriodType.LecturerSelection, name: 'Đăng ký & Duyệt GVHD' },
    { value: ProjectPeriodType.LecturerReview, name: 'Duyệt Đề tài & Chốt nhóm' },
    { value: ProjectPeriodType.ProjectExecution, name: 'Thực hiện Đồ án' },
    { value: ProjectPeriodType.FinalDefense, name: 'Nộp Báo cáo & Bảo vệ' },
  ];

  // Semester State
  semesters: SemesterPublicResponse[] = [];
  loadingSemesters = false;
  savingSemester = false;
  isSemesterModalOpen = false;
  editingSemester: SemesterPublicResponse | null = null;
  semesterForm = {
    code: '',
    name: '',
    startDate: '',
    endDate: '',
    isActive: true
  };

  // Paging/Search
  pageIndex = 1;
  pageSize = 10;
  rowCount = 0;
  searchTerm = '';

  // ProjectPeriod State
  semesterPeriods: ProjectPeriodResponse[] = [];
  loadingPeriods = false;
  savingPeriod = false;
  isPeriodListModalOpen = false;
  isPeriodEditModalOpen = false;
  selectedSemester: SemesterPublicResponse | null = null;
  editingPeriod: ProjectPeriodResponse | null = null;
  periodForm = {
    name: '',
    description: '',
    academicYear: '',
    stage: 1,
    type: ProjectPeriodType.MajorSelection,
    startDate: '',
    endDate: '',
    status: 0
  };

  constructor(
    private readonly pdtTimeService: PdtTimeService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadSemesters();
  }

  // --- Semester Actions ---

  loadSemesters(): void {
    this.loadingSemesters = true;
    this.pdtTimeService.getSemestersPaging({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm
    }).pipe(finalize(() => {
      this.loadingSemesters = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.semesters = res.data.results;
          this.rowCount = res.data.rowCount;
        }
      },
      error: (err) => this.showError(err, 'Không thể tải danh sách học kỳ.')
    });
  }

  goToPage(page: number): void {
    this.pageIndex = page;
    this.loadSemesters();
  }

  openSemesterModal(semester?: SemesterPublicResponse): void {
    if (semester) {
      this.editingSemester = semester;
      this.semesterForm = {
        code: semester.code || '',
        name: semester.name || '',
        startDate: this.pdtTimeService.toDateInputValue(semester.startDate),
        endDate: this.pdtTimeService.toDateInputValue(semester.endDate),
        isActive: semester.isActive
      };
    } else {
      this.editingSemester = null;
      this.semesterForm = {
        code: '',
        name: '',
        startDate: '',
        endDate: '',
        isActive: true
      };
    }
    this.isSemesterModalOpen = true;
  }

  saveSemester(): void {
    if (!this.semesterForm.code || !this.semesterForm.name) {
      this.notify.emit({ message: 'Vui lòng nhập đầy đủ Mã và Tên học kỳ.' });
      return;
    }

    this.savingSemester = true;
    const req: SemesterCreateRequest = {
      ...this.semesterForm,
      startDate: this.pdtTimeService.toIsoDate(this.semesterForm.startDate) || '',
      endDate: this.pdtTimeService.toIsoDate(this.semesterForm.endDate) || ''
    };

    const obs = this.editingSemester
      ? this.pdtTimeService.updateSemester(this.editingSemester.id, req)
      : this.pdtTimeService.createSemester(req);

    obs.pipe(finalize(() => (this.savingSemester = false)))
      .subscribe({
        next: () => {
          this.notify.emit({ message: this.editingSemester ? 'Cập nhật học kỳ thành công.' : 'Thêm học kỳ thành công.' });
          this.isSemesterModalOpen = false;
          this.loadSemesters();
        },
        error: (err) => this.showError(err, 'Lỗi khi lưu học kỳ.')
      });
  }

  deleteSemester(id: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa học kỳ này?')) return;

    this.pdtTimeService.deleteSemester(id).subscribe({
      next: () => {
        this.notify.emit({ message: 'Đã xóa học kỳ.' });
        this.loadSemesters();
      },
      error: (err) => this.showError(err, 'Lỗi khi xóa học kỳ.')
    });
  }

  // --- ProjectPeriod Actions ---

  openPeriodListModal(semester: SemesterPublicResponse): void {
    this.selectedSemester = semester;
    this.loadPeriods(semester.id);
    this.isPeriodListModalOpen = true;
  }

  loadPeriods(semesterId: string): void {
    this.loadingPeriods = true;
    this.pdtTimeService.getPeriodsPaging({
      pageIndex: 1,
      pageSize: 100,
      semesterId: semesterId
    }).pipe(finalize(() => {
      this.loadingPeriods = false;
      this.cdr.detectChanges();
    })).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.semesterPeriods = res.data.results;
        }
      },
      error: (err) => this.showError(err, 'Không thể tải danh sách giai đoạn.')
    });
  }

  getPeriodTypeName(type: number): string {
    return this.periodTypes.find(t => t.value === type)?.name || 'Không xác định';
  }

  openPeriodEditModal(period?: ProjectPeriodResponse): void {
    if (period && period.id) {
      this.pdtTimeService.getPeriodById(period.id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const data = res.data;
            this.editingPeriod = data;
            this.periodForm = {
              name: data.name || '',
              description: data.description || '',
              academicYear: data.academicYear || this.selectedSemester?.name?.split(' ').pop() || '',
              stage: data.stage,
              type: data.type,
              startDate: this.pdtTimeService.toDateInputValue(data.startDate),
              endDate: this.pdtTimeService.toDateInputValue(data.endDate),
              status: data.status || 0,
            };
            this.isPeriodEditModalOpen = true;
          } else {
            this.notify.emit({ message: 'Không thể lấy thông tin chi tiết của giai đoạn này.' });
          }
        },
        error: (err) => this.showError(err, 'Lỗi khi tải chi tiết giai đoạn.')
      });
    } else {
      this.editingPeriod = null;
      this.periodForm = {
        name: '',
        description: '',
        academicYear: this.selectedSemester?.name?.split(' ').pop() || '',
        stage: this.semesterPeriods.length + 1,
        type: ProjectPeriodType.MajorSelection,
        startDate: '',
        endDate: '',
        status: 0,
      };
      this.isPeriodEditModalOpen = true;
    }
  }

  savePeriod(): void {
    if (!this.selectedSemester) return;
    if (!this.periodForm.name || !this.periodForm.startDate || !this.periodForm.endDate) {
      this.notify.emit({ message: 'Vui lòng nhập đầy đủ tên và thời gian giai đoạn.' });
      return;
    }

    this.savingPeriod = true;
    const req: ProjectPeriodCreateRequest = {
      ...this.periodForm,
      semesterId: this.selectedSemester.id,
      startDate: this.pdtTimeService.toIsoDate(this.periodForm.startDate) || '',
      endDate: this.pdtTimeService.toIsoDate(this.periodForm.endDate) || '',
    };

    const obs = this.editingPeriod
      ? this.pdtTimeService.updatePeriod(this.editingPeriod.id, req as any)
      : this.pdtTimeService.createPeriod(req);

    obs.pipe(finalize(() => (this.savingPeriod = false)))
      .subscribe({
        next: () => {
          this.notify.emit({ message: this.editingPeriod ? 'Cập nhật giai đoạn thành công.' : 'Thêm giai đoạn thành công.' });
          this.isPeriodEditModalOpen = false;
          this.loadPeriods(this.selectedSemester!.id);
        },
        error: (err) => this.showError(err, 'Lỗi khi lưu giai đoạn.')
      });
  }

  deletePeriod(id: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa giai đoạn này?')) return;

    this.pdtTimeService.deletePeriod(id).subscribe({
      next: () => {
        this.notify.emit({ message: 'Đã xóa giai đoạn.' });
        if (this.selectedSemester) this.loadPeriods(this.selectedSemester.id);
      },
      error: (err) => this.showError(err, 'Lỗi khi xóa giai đoạn.')
    });
  }

  private showError(error: any, defaultMsg: string): void {
    const msg = error.error?.message || error.message || defaultMsg;
    this.notify.emit({ message: msg });
  }
}
