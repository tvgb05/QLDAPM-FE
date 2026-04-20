import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { PdtTopicService } from '../services/pdt-topic.service';
import { TopicFormOption, TopicTableItem } from '../pdt-topic.models';
import { NotificationItem } from '../../../shared/models/ui.models';

@Component({
  selector: 'app-pdt-topics-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './pdt-topics-tab.component.html',
})
export class PdtTopicsTabComponent implements OnInit {
  @Output() notify = new EventEmitter<NotificationItem>();

  readonly icons = APP_ICONS;
  loadingTopics = false;
  savingTopic = false;
  topicsLoaded = false;

  topics: TopicTableItem[] = [];
  topicTeams: TopicFormOption[] = [];
  topicLecturers: TopicFormOption[] = [];
  topicForm = {
    projectTeamId: '',
    teacherId: '',
    title: '',
    description: '',
  };

  constructor(private readonly pdtTopicService: PdtTopicService) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  saveTopic(): void {
    if (!this.topicForm.projectTeamId) {
      this.notify.emit({
        message:
          'TODO: Swagger yêu cầu projectTeamId khi tạo ProjectTopic, nên không thể tạo đề tài nếu chưa chọn nhóm.',
      });
      return;
    }

    if (!this.topicForm.teacherId || !this.topicForm.title.trim()) {
      this.notify.emit({
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
          this.notify.emit({
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
          this.notify.emit({
            message:
              error.error?.message ??
              error.message ??
              'Không thể tạo đề tài theo dữ liệu hiện tại.',
          });
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
          this.notify.emit({
            message:
              error.error?.message ??
              error.message ??
              'Không thể tải danh sách đề tài.',
          });
        },
      });
  }
}
