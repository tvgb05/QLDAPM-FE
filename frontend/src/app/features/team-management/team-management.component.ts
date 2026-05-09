import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { APP_ICONS } from '../../shared/icons/app-icons';
import { AuthService } from '../../shared/services/auth.service';
import { LecturerSelectionService } from '../lecturer-selection/services/lecturer-selection.service';
import { TeamManagementService } from './services/team-management.service';
import { ProjectTeamResponse, TeamMemberResponse } from './team-management.models';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AppHeaderComponent,
  ],
  templateUrl: './team-management.component.html',
})
export class TeamManagementComponent implements OnInit {
  currentUserName = 'Sinh viên';
  loading = true;
  saving = false;
  
  // Notification state
  notification: { message: string, type: 'success' | 'error' | null } = { message: '', type: null };
  private notificationTimeout: any;
  readonly icons = APP_ICONS;

  studentId: string | null = null;
  myTeam: ProjectTeamResponse | null = null;
  pendingInvites: TeamMemberResponse[] = [];
  
  // UI States
  showInviteModal = false;
  inviteStudentCode = '';
  inviteError = '';
  
  // Context
  hasApprovedSupervisor = false;
  approvedSupervisorName = '';

  constructor(
    private readonly authService: AuthService,
    private readonly teamService: TeamManagementService,
    private readonly lecturerService: LecturerSelectionService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserName = currentUser.fullName || currentUser.userName || 'Sinh viên';
    }
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    forkJoin({
      studentContext: this.lecturerService.loadStudentContext(currentUser).pipe(catchError(() => of(null))),
      teamRes: this.teamService.getMyTeam().pipe(catchError(() => of({ success: false, data: null }))),
      invitesRes: this.teamService.getPendingInvites().pipe(catchError(() => of({ success: false, data: [] })))
    }).subscribe({
      next: (res: any) => {
        // Sử dụng setTimeout để tránh lỗi ExpressionChangedAfterItHasBeenCheckedError (NG0100)
        setTimeout(() => {
          if (res.studentContext) {
            this.studentId = res.studentContext.studentId;
            this.hasApprovedSupervisor = res.studentContext.registrationStatus === 1;
            this.approvedSupervisorName = res.studentContext.approvedLecturerName || '';
          }
          
          if (res.teamRes?.success) {
            this.myTeam = res.teamRes.data;
          } else {
            this.myTeam = null;
          }
          
          if (res.invitesRes?.success) {
            this.pendingInvites = res.invitesRes.data || [];
          } else {
            this.pendingInvites = [];
          }
          
          this.loading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('Fatal error in loadData:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createTeam(): void {
    if (!this.hasApprovedSupervisor) return;
    
    this.saving = true;
    this.teamService.createTeam({ teamName: null }).subscribe({
      next: (res) => {
        if (res.success) {
          this.myTeam = res.data;
          this.loadData(); // Refresh to get all details
        }
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  openInviteModal(): void {
    this.showInviteModal = true;
    this.inviteStudentCode = '';
    this.inviteError = '';
  }

  sendInvite(): void {
    if (!this.myTeam || !this.inviteStudentCode) return;
    
    this.saving = true;
    this.inviteError = '';
    
    this.teamService.inviteMember(this.myTeam.id, { studentCode: this.inviteStudentCode }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showInviteModal = false;
          this.inviteStudentCode = '';
          this.showNotification(res.message || 'Đã gửi lời mời thành công', 'success');
          this.loadData();
        } else {
          this.inviteError = res.message || 'Lỗi khi gửi lời mời';
        }
        this.saving = false;
      },
      error: (err) => {
        this.inviteError = err.error?.message || 'Lỗi hệ thống';
        this.saving = false;
      }
    });
  }

  respondToInvite(teamId: string, accept: boolean): void {
    this.saving = true;
    this.teamService.respondToInvite({ teamId, accept }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showNotification(res.message || (accept ? 'Đã tham gia nhóm' : 'Đã từ chối lời mời'), 'success');
          this.loadData();
        } else {
          this.showNotification(res.message || 'Lỗi xử lý phản hồi', 'error');
        }
        this.saving = false;
      },
      error: (err) => {
        this.showNotification(err.error?.message || 'Lỗi hệ thống', 'error');
        this.saving = false;
      }
    });
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      this.notification = { message: '', type: null };
      this.cdr.detectChanges();
    }, 5000);
    this.cdr.detectChanges();
  }

  leaveTeam(): void {
    if (!this.myTeam) return;
    if (!confirm('Bạn có chắc chắn muốn rời nhóm này?')) return;
    
    this.saving = true;
    this.teamService.leaveTeam(this.myTeam.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.myTeam = null;
          this.loadData();
        }
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  dissolveTeam(): void {
    if (!this.myTeam) return;
    if (!confirm('Bạn có chắc chắn muốn GIẢI TÁN nhóm này? Toàn bộ thành viên sẽ bị rời khỏi nhóm.')) return;
    
    this.saving = true;
    this.teamService.dissolveTeam(this.myTeam.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.myTeam = null;
          this.loadData();
        }
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  isLeader(): boolean {
    if (!this.myTeam || !this.studentId) return false;
    return String(this.myTeam.leaderStudentId).toLowerCase() === String(this.studentId).toLowerCase();
  }
}
