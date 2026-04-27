import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { MajorSelectionService } from '../services/major-selection.service';
import { RegistrationResponse } from '../major-selection.models';

@Component({
  selector: 'app-major-registrations-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-800">Danh sách đăng ký chuyên ngành</h3>
          <p class="text-sm text-slate-500">Quản lý và phê duyệt đăng ký của sinh viên</p>
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
              <th class="px-6 py-4 font-semibold">Ngày đăng ký</th>
              <th class="px-6 py-4 font-semibold">Trạng thái</th>
              <th class="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngIf="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-8 text-center text-slate-400">Đang tải dữ liệu...</td>
            </tr>
            <tr *ngIf="!loading && registrations.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-400">Không có dữ liệu đăng ký.</td>
            </tr>
            <tr *ngFor="let reg of registrations" class="hover:bg-slate-50/50 transition">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {{ (reg.studentName || 'SV').substring(0, 2).toUpperCase() }}
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
              <td class="px-6 py-4 text-sm text-slate-600">
                {{ reg.submittedAt | date: 'dd/MM/yyyy HH:mm' }}
              </td>
              <td class="px-6 py-4">
                <span [ngClass]="getStatusClass(reg.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ getStatusLabel(reg.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="p-2 text-slate-400 hover:text-blue-600 transition">
                  <i-lucide [name]="icons.externalLink" class="w-4 h-4"></i-lucide>
                </button>
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
  `,
})
export class MajorRegistrationsListComponent implements OnInit {
  readonly icons = APP_ICONS;
  registrations: RegistrationResponse[] = [];
  loading = false;
  searchTerm = '';
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;

  constructor(
    private readonly majorSelectionService: MajorSelectionService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading = true;
    this.majorSelectionService
      .getAllRegistrations(this.pageIndex, this.pageSize, this.searchTerm)
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
          console.error('Failed to load registrations');
        },
      });
  }

  changePage(index: number): void {
    this.pageIndex = index;
    this.loadRegistrations();
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
