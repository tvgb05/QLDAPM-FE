import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { APP_ICONS } from '../../../shared/icons/app-icons';
import { UnassignedStudent, AvailableGroup, PdtTab } from '../pdt.models';
import { NotificationItem } from '../../../shared/models/ui.models';

@Component({
  selector: 'app-pdt-allocation-tab',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pdt-allocation-tab.component.html',
})
export class PdtAllocationTabComponent {
  @Output() notify = new EventEmitter<NotificationItem>();

  readonly icons = APP_ICONS;
  assignModalOpen = false;
  assignStudentName = '';

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

  openAssignModal(studentName: string): void {
    this.assignStudentName = studentName;
    this.assignModalOpen = true;
  }

  confirmAssign(): void {
    this.notify.emit({
      message: `Đã phân công sinh viên vào nhóm thành công: <b>${this.assignStudentName}</b>.`,
    });
    this.assignModalOpen = false;
  }
}
