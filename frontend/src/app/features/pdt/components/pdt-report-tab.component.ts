import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { PdtResultService } from '../services/pdt-result.service';
import { ReportKey, ReportSection } from '../pdt.models';
import { NotificationItem } from '../../../shared/models/ui.models';

@Component({
  selector: 'app-pdt-report-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pdt-report-tab.component.html',
})
export class PdtReportTabComponent implements OnInit {
  @Output() notify = new EventEmitter<NotificationItem>();

  readonly icons = APP_ICONS;
  loadingReport = false;
  reportLoaded = false;
  reportItems: Record<ReportKey, boolean> = {
    topic01: true,
    topic02: false,
  };

  readonly reportSections: ReportSection[] = [
    {
      key: 'topic01' as const,
      badgeClass: 'bg-indigo-100 text-indigo-700',
      title: 'Phát triển Ứng dụng Web & Mobile',
      lecturers: ['TS. Nguyễn Văn A', 'ThS. Lê Văn C'],
      groupCount: '02',
      rows: [
        {
          group: 'N01',
          title: 'Hệ thống E-commerce đa nền tảng',
          ids: ['2011001', '2011002'],
          students: ['Trần Văn X', 'Lê Thị Y'],
          advisor: 'TS. Nguyễn Văn A',
          status: 'Hoàn thành',
          statusClass: 'bg-green-100 text-green-700',
          rowClass: '',
        },
        {
          group: 'N02',
          title: 'Ứng dụng đặt món ăn (Food Delivery)',
          ids: ['2011005', '2011008', '2011009'],
          students: ['Phạm Văn Z', 'Đỗ Thị K', 'Hoàng Văn M'],
          advisor: 'ThS. Lê Văn C',
          status: 'Đang làm',
          statusClass: 'bg-yellow-100 text-yellow-700',
          rowClass: 'bg-slate-50/30',
        },
      ],
    },
    {
      key: 'topic02' as const,
      badgeClass: 'bg-pink-100 text-pink-700',
      title: 'Trí tuệ nhân tạo (AI) & Computer Vision',
      lecturers: ['PGS. TS. Trần Thị B'],
      groupCount: '01',
      rows: [
        {
          group: 'N03',
          title: 'Hệ thống nhận diện khuôn mặt điểm danh',
          ids: ['2011020'],
          students: ['Ngô Văn P'],
          advisor: 'PGS. TS. Trần Thị B',
          status: 'Cảnh báo',
          statusClass: 'bg-red-100 text-red-700',
          rowClass: '',
        },
      ],
    },
  ];

  constructor(private readonly pdtResultService: PdtResultService) {}

  ngOnInit(): void {
    this.loadReportResults();
  }

  toggleReportItem(id: ReportKey): void {
    this.reportItems[id] = !this.reportItems[id];
  }

  private loadReportResults(): void {
    this.loadingReport = true;
    this.pdtResultService
      .loadReportSections(this.reportSections)
      .pipe(finalize(() => (this.loadingReport = false)))
      .subscribe({
        next: (sections) => {
          this.reportSections.splice(0, this.reportSections.length, ...sections);
          this.reportLoaded = true;
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.notify.emit({
            message:
              error.error?.message ??
              error.message ??
              'Không thể tải kết quả Training Office Result.',
          });
        },
      });
  }
}
