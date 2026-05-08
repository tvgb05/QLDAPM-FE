import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { ApiService } from '../../../shared/services/api.service';
import { ApiResponse, PagedResult } from '../../../shared/models/api-response.model';
import {
  RegistrationResponse,
  SupervisorApproveRequest,
  SupervisorRejectRequest,
} from '../lecturer-selection.models';

@Component({
  selector: 'app-supervisor-registrations-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Đăng ký Giáo viên Hướng dẫn</h3>
          <p class="text-sm text-slate-500">Quản lý và phê duyệt đăng ký GVHD của sinh viên</p>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative">
            <i-lucide [name]="icons.search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i-lucide>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (keyup.enter)="loadRegistrations()"
              placeholder="Tìm kiếm sinh viên..."
              class="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
          <button
            (click)="loadRegistrations()"
            class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
          >
            <i-lucide [name]="icons.refreshCw" class="w-5 h-5"></i-lucide>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold">Sinh viên</th>
              <th class="px-6 py-4 font-semibold">Chuyên ngành</th>
              <th class="px-6 py-4 font-semibold">GVHD đăng ký</th>
              <th class="px-6 py-4 font-semibold">Ngày đăng ký</th>
              <th class="px-6 py-4 font-semibold">Trạng thái</th>
              <th class="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngIf="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-8 text-center text-slate-400">Đang tải dữ liệu...</td>
            </tr>
            <tr *ngIf="!loading && registrations.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-slate-400">Không có dữ liệu đăng ký.</td>
            </tr>
            <tr *ngFor="let reg of registrations" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {{ getInitials(reg.studentName) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-slate-800">{{ reg.studentName || 'Chưa cập nhật tên' }}</div>
                    <div class="text-xs text-slate-500">Mã SV: {{ reg.studentCode || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                  {{ reg.selectedMajorName || 'Chưa xác định' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div *ngIf="reg.choices && reg.choices.length > 0">
                  <span class="text-sm font-medium text-slate-700">{{ reg.choices[0].lecturerName || 'Chưa rõ' }}</span>
                </div>
                <div *ngIf="reg.approvedLecturerName && reg.status === 1" class="mt-1">
                  <span class="text-xs text-green-600 font-medium">✓ Duyệt: {{ reg.approvedLecturerName }}</span>
                </div>
                <span *ngIf="!reg.choices?.length && !reg.approvedLecturerName" class="text-xs text-slate-400">Chưa chọn</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                {{ reg.submittedAt | date: 'dd/MM/yyyy HH:mm' }}
              </td>
              <td class="px-6 py-4">
                <span [ngClass]="getStatusClass(reg.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ getStatusLabel(reg.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2" *ngIf="reg.status === 0">
                  <button
                    (click)="openApproveModal(reg)"
                    [disabled]="processingId === reg.id"
                    class="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition disabled:opacity-50 border border-green-200"
                  >
                    <span class="flex items-center gap-1">
                      <i-lucide [name]="icons.checkCheck" class="w-3.5 h-3.5"></i-lucide>
                      Duyệt
                    </span>
                  </button>
                  <button
                    (click)="openRejectModal(reg)"
                    [disabled]="processingId === reg.id"
                    class="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition disabled:opacity-50 border border-red-200"
                  >
                    <span class="flex items-center gap-1">
                      <i-lucide [name]="icons.x" class="w-3.5 h-3.5"></i-lucide>
                      Từ chối
                    </span>
                  </button>
                </div>
                <span *ngIf="reg.status === 1" class="text-xs text-green-600">Đã duyệt</span>
                <span *ngIf="reg.status === 2" class="text-xs text-red-600">Đã từ chối</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div class="text-xs text-slate-500">
          Hiển thị {{ registrations.length }} / {{ totalCount }} kết quả
        </div>
        <div class="flex items-center gap-2">
          <button
            [disabled]="pageIndex === 1"
            (click)="changePage(pageIndex - 1)"
            class="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition"
          >
            <i-lucide [name]="icons.chevronLeft" class="w-4 h-4"></i-lucide>
          </button>
          <span class="text-sm font-medium px-4">Trang {{ pageIndex }}</span>
          <button
            [disabled]="registrations.length < pageSize"
            (click)="changePage(pageIndex + 1)"
            class="p-2 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-white transition"
          >
            <i-lucide [name]="icons.chevronRight" class="w-4 h-4"></i-lucide>
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div *ngIf="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-2">Từ chối đăng ký GVHD</h3>
        <p class="text-sm text-slate-500 mb-4">
          Sinh viên: <strong>{{ selectedRegistration?.studentName }}</strong>
        </p>
        <textarea
          [(ngModel)]="rejectReasonInput"
          class="w-full h-24 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none resize-none"
          placeholder="Nhập lý do từ chối..."
        ></textarea>
        <div class="flex justify-end gap-3 mt-4">
          <button (click)="closeModals()" class="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Hủy</button>
          <button (click)="confirmReject()" class="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-sm">Xác nhận từ chối</button>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div *ngIf="showApproveModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-bold text-slate-800 mb-2">Phê duyệt đăng ký GVHD</h3>
        <div *ngIf="selectedRegistration" class="mb-4 space-y-1">
          <p class="text-sm text-slate-600">Sinh viên: <strong>{{ selectedRegistration.studentName }}</strong></p>
          <p class="text-sm text-slate-600" *ngIf="selectedRegistration.choices?.length">
            GVHD đăng ký: <strong>{{ selectedRegistration.choices![0].lecturerName || 'Chưa rõ' }}</strong>
          </p>
        </div>
        <div class="flex justify-end gap-3 mt-4">
          <button (click)="closeModals()" class="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Hủy</button>
          <button (click)="confirmApprove()" class="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm">Xác nhận duyệt</button>
        </div>
      </div>
    </div>
  `,
})
export class SupervisorRegistrationsListComponent implements OnInit {
  readonly icons = APP_ICONS;
  registrations: RegistrationResponse[] = [];
  loading = false;
  searchTerm = '';
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  processingId: string | null = null;

  showRejectModal = false;
  showApproveModal = false;
  selectedRegistration: RegistrationResponse | null = null;
  rejectReasonInput = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading = true;
    const url = `/supervisor-registrations?PageIndex=${this.pageIndex}&PageSize=${this.pageSize}&SearchTerm=${this.searchTerm}`;
    this.apiService
      .get<ApiResponse<PagedResult<RegistrationResponse>>>(url)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.registrations = response.data?.results ?? [];
          this.totalCount = response.data?.rowCount ?? 0;
          this.cdr.detectChanges();
        },
        error: () => {
          console.error('Failed to load supervisor registrations');
        },
      });
  }

  changePage(index: number): void {
    this.pageIndex = index;
    this.loadRegistrations();
  }

  openApproveModal(reg: RegistrationResponse): void {
    this.selectedRegistration = reg;
    this.showApproveModal = true;
  }

  openRejectModal(reg: RegistrationResponse): void {
    this.selectedRegistration = reg;
    this.rejectReasonInput = '';
    this.showRejectModal = true;
  }

  closeModals(): void {
    this.showRejectModal = false;
    this.showApproveModal = false;
    this.selectedRegistration = null;
    this.rejectReasonInput = '';
  }

  confirmApprove(): void {
    if (!this.selectedRegistration) return;

    const reg = this.selectedRegistration;
    const lecturerId = reg.choices?.[0]?.lecturerId;
    if (!lecturerId) {
      this.closeModals();
      return;
    }

    this.processingId = reg.id;
    const payload: SupervisorApproveRequest = { approvedLecturerId: lecturerId };

    this.apiService
      .put<ApiResponse<RegistrationResponse>>(`/supervisor-registrations/${reg.id}/approve`, payload)
      .pipe(finalize(() => {
        this.processingId = null;
        this.closeModals();
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.loadRegistrations();
        },
        error: (err) => {
          console.error('Approve failed', err);
        },
      });
  }

  confirmReject(): void {
    if (!this.selectedRegistration) return;

    const reg = this.selectedRegistration;
    this.processingId = reg.id;
    const payload: SupervisorRejectRequest = {
      rejectReason: this.rejectReasonInput.trim() || 'Bị từ chối bởi Phòng Đào tạo.',
    };

    this.apiService
      .put<ApiResponse<RegistrationResponse>>(`/supervisor-registrations/${reg.id}/reject`, payload)
      .pipe(finalize(() => {
        this.processingId = null;
        this.closeModals();
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.loadRegistrations();
        },
        error: (err) => {
          console.error('Reject failed', err);
        },
      });
  }

  getInitials(name?: string | null): string {
    const n = name?.trim() || 'SV';
    return n.substring(0, 2).toUpperCase();
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Chờ duyệt';
      case 1: return 'Đã duyệt';
      case 2: return 'Bị từ chối';
      default: return 'Không xác định';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 1: return 'bg-green-50 text-green-600 border border-green-100';
      case 2: return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  }
}
