import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { AppRole, NotificationItem } from '../../shared/models/ui.models';
import { PdtAdminSidebarComponent } from './components/pdt-admin-sidebar.component';
import { PdtTab, ReportKey, ReportSection, UnassignedStudent, AvailableGroup } from './pdt.models';
import { PdtTimeService } from './services/pdt-time.service';
import { PdtTopicService } from './services/pdt-topic.service';
import { PdtResultService } from './services/pdt-result.service';
import { ProjectPeriodResponse, SemesterPublicResponse, TimeConfigForm } from './pdt-time.models';
import { TopicFormOption, TopicTableItem } from './pdt-topic.models';

@Component({
  selector: 'app-pdt',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AppHeaderComponent,
    PdtAdminSidebarComponent,
  ],
  templateUrl: './pdt.component.html',
})
export class PdtComponent implements OnInit, AfterViewInit {
  readonly icons = APP_ICONS;
  role: AppRole = 'student';
  userName = 'Nguyễn Văn A';
  userBadge = 'PDT';
  showNotifications = false;
  notifications: NotificationItem[] = [];
  activeTab: PdtTab = 'time';
  assignModalOpen = false;
  assignStudentName = '';
  reportItems: Record<ReportKey, boolean> = {
    topic01: true,
    topic02: false,
  };
  loadingTimeConfig = false;
  savingTimeConfig = false;
  loadingTopics = false;
  savingTopic = false;
  topicsLoaded = false;
  loadingReport = false;
  reportLoaded = false;
  private timeConfigLoaded = false;
  timeConfig: TimeConfigForm = {
    stage1StartDate: '',
    stage1EndDate: '',
    stage2StartDate: '',
    stage2EndDate: '',
    stage3PublishDate: '',
  };
  private projectPeriods: ProjectPeriodResponse[] = [];
  private semesters: SemesterPublicResponse[] = [];

  topics: TopicTableItem[] = [];
  topicTeams: TopicFormOption[] = [];
  topicLecturers: TopicFormOption[] = [];
  topicForm = {
    projectTeamId: '',
    teacherId: '',
    title: '',
    description: '',
  };

  constructor(
    private readonly pdtTimeService: PdtTimeService,
    private readonly pdtTopicService: PdtTopicService,
    private readonly pdtResultService: PdtResultService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTimeConfig();
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => {
      if (this.activeTab === 'time' && !this.timeConfigLoaded && !this.loadingTimeConfig) {
        this.loadTimeConfig();
      }
    }, 250);
  }

  readonly unassignedStudents: UnassignedStudent[] = [
    { name: 'Phạm Văn D', studentId: '2011005', faculty: 'K.H.M.T' },
    { name: 'Lê Thị E', studentId: '2011006', faculty: 'K.H.M.T' },
  ];

  readonly availableGroups: AvailableGroup[] = [
    {
      title: 'Chuyên ngành gì đó',
      slots: 'Còn 2 chỗ',
      slotsClass: 'bg-green-100 text-green-700',
      lecturers: 'GV: TS. Nguyễn Văn A, ThS. Lê Văn C',
      members: ['A', 'B'],
      progressClass: 'bg-green-500',
      progress: 60,
      memberCount: '3/5 Thành viên',
    },
    {
      title: 'Chuyên ngành gì đó nữa',
      slots: 'Còn 1 chỗ',
      slotsClass: 'bg-yellow-100 text-yellow-700',
      lecturers: 'GV: TS. Trần Thị B',
      members: ['D', 'E', 'F', 'G'],
      progressClass: 'bg-yellow-500',
      progress: 80,
      memberCount: '4/5 Thành viên',
    },
  ];

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

  switchRole(role: AppRole): void {
    this.role = role;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  clearNotifications(): void {
    this.notifications = [];
    this.showNotifications = false;
  }

  switchAdminTab(tabName: PdtTab): void {
    this.activeTab = tabName;

    if (tabName === 'time') {
      this.loadTimeConfig();
    }

    if (tabName === 'topics' && !this.topicsLoaded) {
      this.loadTopics();
    }

    if (tabName === 'report' && !this.reportLoaded) {
      this.loadReportResults();
    }
  }

  openAssignModal(studentName: string): void {
    this.assignStudentName = studentName;
    this.assignModalOpen = true;
  }

  confirmAssign(): void {
    this.notifications.unshift({
      message: `Đã phân công sinh viên vào nhóm thành công: <b>${this.assignStudentName}</b>.`,
    });
    this.assignModalOpen = false;
  }

  toggleReportItem(id: ReportKey): void {
    this.reportItems[id] = !this.reportItems[id];
  }

  updateTimeField(field: keyof TimeConfigForm, event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.timeConfig = {
      ...this.timeConfig,
      [field]: target?.value ?? '',
    };
  }

  saveConfig(): void {
    this.savingTimeConfig = true;
    this.pdtTimeService
      .saveTimeConfig(this.timeConfig, this.projectPeriods, this.semesters)
      .pipe(finalize(() => (this.savingTimeConfig = false)))
      .subscribe({
        next: () => {
          this.notifications.unshift({ message: 'Đã lưu cấu hình thời gian đăng ký.' });
          this.loadTimeConfig();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.notifications.unshift({
            message:
              error.error?.message ??
              error.message ??
              'Không thể lưu cấu hình thời gian đăng ký.',
          });
        },
      });
  }

  private loadTimeConfig(): void {
    this.loadingTimeConfig = true;
    this.pdtTimeService
      .loadTimeConfig()
      .pipe(finalize(() => (this.loadingTimeConfig = false)))
      .subscribe({
        next: (result) => {
          this.timeConfig = result.form;
          this.projectPeriods = result.periods;
          this.semesters = result.semesters;
          this.timeConfigLoaded = true;
          this.cdr.detectChanges();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.timeConfigLoaded = false;
          this.notifications.unshift({
            message:
              error.error?.message ??
              error.message ??
              'Không thể tải cấu hình thời gian đăng ký.',
          });
          this.cdr.detectChanges();
        },
      });
  }

  private loadTopics(): void {
    this.loadingTopics = true;
    this.pdtTopicService
      .loadTopics()
      .pipe(finalize(() => (this.loadingTopics = false)))
      .subscribe({
        next: (result) => {
          this.topics = result.topics;
          this.topicTeams = result.teams;
          this.topicLecturers = result.lecturers;
          this.topicsLoaded = true;
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.notifications.unshift({
            message:
              error.error?.message ??
              error.message ??
              'Không thể tải danh sách đề tài.',
          });
        },
      });
  }

  saveTopic(): void {
    if (!this.topicForm.projectTeamId) {
      this.notifications.unshift({
        message:
          'TODO: Swagger yêu cầu projectTeamId khi tạo ProjectTopic, nên không thể tạo đề tài nếu chưa chọn nhóm.',
      });
      return;
    }

    if (!this.topicForm.teacherId || !this.topicForm.title.trim()) {
      this.notifications.unshift({
        message: 'Vui lòng chọn giảng viên và nhập tên đề tài trước khi lưu.',
      });
      return;
    }

    this.savingTopic = true;
    this.pdtTopicService
      .createTopic({
        projectTeamId: this.topicForm.projectTeamId,
        teacherId: this.topicForm.teacherId,
        title: this.topicForm.title.trim(),
        description: this.topicForm.description.trim() || null,
      })
      .pipe(finalize(() => (this.savingTopic = false)))
      .subscribe({
        next: () => {
          this.notifications.unshift({
            message: 'Đã tạo đề tài mới theo đúng quan hệ team và giảng viên.',
          });
          this.topicForm = {
            projectTeamId: '',
            teacherId: '',
            title: '',
            description: '',
          };
          this.loadTopics();
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.notifications.unshift({
            message:
              error.error?.message ??
              error.message ??
              'Không thể tạo đề tài theo dữ liệu hiện tại.',
          });
        },
      });
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

          const hasTeamIds = sections.some((section) =>
            section.rows.some((row) => !!row.teamId)
          );

          if (!hasTeamIds) {
            this.notifications.unshift({
              message:
                'TODO: Tab tổng hợp hiện chưa có teamId thật trên từng dòng UI, nên chỉ có thể giữ dữ liệu mock cho đến khi map được ProjectTeam.',
            });
          }
        },
        error: (error: { message?: string; error?: { message?: string | null } }) => {
          this.notifications.unshift({
            message:
              error.error?.message ??
              error.message ??
              'Không thể tải kết quả Training Office Result.',
          });
        },
      });
  }
}
