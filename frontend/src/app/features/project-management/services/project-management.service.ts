import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';

import { AuthResponse } from '../../../shared/models/auth-response.model';
import { TimelineStep } from '../../../shared/models/ui.models';
import { ApiService } from '../../../shared/services/api.service';
import {
  FinalSubmissionCreateRequest,
  FinalSubmissionResponseApiResponse,
  LecturerResponse,
  LecturerResponsePagedApiResponse,
  ProgressReportCreateRequest,
  ProgressReportResponseApiResponse,
  ProgressReportResponsePagedApiResponse,
  ProjectPeriodResponse,
  ProjectPeriodResponsePagedApiResponse,
  ProjectTeamCreateRequest,
  ProjectTeamResponseApiResponse,
  ProjectTeamUpdateRequest,
  ProjectTopicCreateRequest,
  ProjectTopicResponseApiResponse,
  ProjectTopicUpdateRequest,
  SemesterListApiResponse,
  SemesterPublicResponse,
  StudentResponse,
  StudentResponsePagedApiResponse,
} from '../project-management.models';

@Injectable({
  providedIn: 'root',
})
export class ProjectManagementService {
  constructor(private readonly apiService: ApiService) {}

  loadTimeline(): Observable<TimelineStep[]> {
    return forkJoin({
      periodsResponse: this.apiService.get<ProjectPeriodResponsePagedApiResponse>(
        '/ProjectPeriod/paging?PageIndex=1&PageSize=20'
      ),
      semestersResponse: this.apiService.get<SemesterListApiResponse>('/Semester/public-data'),
    }).pipe(
      map(({ periodsResponse, semestersResponse }) =>
        this.mapTimeline(periodsResponse.data?.results ?? [], semestersResponse.data ?? [])
      )
    );
  }

  loadStudentContext(currentUser: AuthResponse | null): Observable<{
    studentId: string | null;
    studentCode: string | null;
    projectPeriodId: string | null;
  }> {
    if (!currentUser) {
      return of({
        studentId: null,
        studentCode: null,
        projectPeriodId: null,
      });
    }

    return forkJoin({
      studentsResponse: this.apiService.get<StudentResponsePagedApiResponse>(
        '/AppStudent/paging?PageIndex=1&PageSize=200'
      ),
      periodsResponse: this.apiService.get<ProjectPeriodResponsePagedApiResponse>(
        '/ProjectPeriod/paging?PageIndex=1&PageSize=20'
      ),
    }).pipe(
      map(({ studentsResponse, periodsResponse }) => {
        const students = studentsResponse.data?.results ?? [];
        const periods = periodsResponse.data?.results ?? [];
        const student = students.find((item) => item.appUserId === currentUser.id) ?? null;
        const stageThreePeriod = periods.find((item) => item.stage === 3) ?? null;

        return {
          studentId: student?.id ?? null,
          studentCode: student?.studentCode ?? null,
          projectPeriodId: stageThreePeriod?.id ?? null,
        };
      })
    );
  }

  loadLecturerContext(currentUser: AuthResponse | null): Observable<{
    lecturerId: string | null;
  }> {
    if (!currentUser) {
      return of({ lecturerId: null });
    }

    return this.apiService
      .get<LecturerResponsePagedApiResponse>('/AppLecturer/paging?PageIndex=1&PageSize=200')
      .pipe(
        map((response) => {
          const lecturers = response.data?.results ?? [];
          const lecturer = lecturers.find((item) => item.appUserId === currentUser.id) ?? null;
          return {
            lecturerId: lecturer?.id ?? null,
          };
        })
      );
  }

  createTeam(payload: ProjectTeamCreateRequest): Observable<ProjectTeamResponseApiResponse> {
    return this.apiService.post<ProjectTeamResponseApiResponse>('/ProjectTeam', payload);
  }

  getTeam(id: string): Observable<ProjectTeamResponseApiResponse> {
    return this.apiService.get<ProjectTeamResponseApiResponse>(`/ProjectTeam/${id}`);
  }

  updateTeam(id: string, payload: ProjectTeamUpdateRequest): Observable<ProjectTeamResponseApiResponse> {
    return this.apiService.put<ProjectTeamResponseApiResponse>(`/ProjectTeam/${id}`, payload);
  }

  createTopic(payload: ProjectTopicCreateRequest): Observable<ProjectTopicResponseApiResponse> {
    return this.apiService.post<ProjectTopicResponseApiResponse>('/ProjectTopic', payload);
  }

  getTopic(id: string): Observable<ProjectTopicResponseApiResponse> {
    return this.apiService.get<ProjectTopicResponseApiResponse>(`/ProjectTopic/${id}`);
  }

  updateTopic(id: string, payload: ProjectTopicUpdateRequest): Observable<ProjectTopicResponseApiResponse> {
    return this.apiService.put<ProjectTopicResponseApiResponse>(`/ProjectTopic/${id}`, payload);
  }

  createProgressReport(
    payload: ProgressReportCreateRequest
  ): Observable<ProgressReportResponseApiResponse> {
    return this.apiService.post<ProgressReportResponseApiResponse>('/ProgressReport', payload);
  }

  getProgressReport(id: string): Observable<ProgressReportResponseApiResponse> {
    return this.apiService.get<ProgressReportResponseApiResponse>(`/ProgressReport/${id}`);
  }

  listProgressReports(): Observable<ProgressReportResponsePagedApiResponse> {
    return this.apiService.get<ProgressReportResponsePagedApiResponse>(
      '/ProgressReport/paging?PageIndex=1&PageSize=200'
    );
  }

  deleteProgressReport(id: string): Observable<void> {
    return this.apiService.delete<void>(`/ProgressReport/${id}`);
  }

  getFinalSubmissionByTeam(teamId: string): Observable<FinalSubmissionResponseApiResponse> {
    return this.apiService.get<FinalSubmissionResponseApiResponse>(
      `/FinalSubmission/team/${teamId}`
    );
  }

  createFinalSubmission(
    payload: FinalSubmissionCreateRequest
  ): Observable<FinalSubmissionResponseApiResponse> {
    return this.apiService.post<FinalSubmissionResponseApiResponse>('/FinalSubmission', payload);
  }

  deleteFinalSubmission(id: string): Observable<void> {
    return this.apiService.delete<void>(`/FinalSubmission/${id}`);
  }

  private mapTimeline(
    periods: ProjectPeriodResponse[],
    semesters: SemesterPublicResponse[]
  ): TimelineStep[] {
    const semesterMap = new Map(semesters.map((semester) => [semester.id, semester]));
    const currentStage = this.getCurrentStage(periods);

    return [1, 2, 3].map((stage) => {
      const period = periods.find((item) => item.stage === stage) ?? null;
      const semester = period ? semesterMap.get(period.semesterId) : null;
      const isCompleted = currentStage !== null && stage < currentStage;
      const isActive = currentStage !== null ? stage === currentStage : stage === 3;

      return {
        step: String(stage),
        title: `Giai đoạn ${stage}`,
        subtitle:
          stage === 1
            ? 'Chọn Hướng Chuyên ngành'
            : stage === 2
              ? 'Đăng ký GVHD'
              : 'Thực hiện Đồ án',
        badge: isCompleted ? 'Hoàn thành' : isActive ? 'Đang diễn ra' : 'Sắp tới',
        badgeClass: isCompleted
          ? 'bg-green-50 text-green-700 border border-green-100'
          : isActive
            ? 'bg-blue-50 text-blue-700 border border-blue-100'
            : 'bg-slate-100 text-slate-500 border border-slate-200',
        textClass: isActive ? 'text-blue-700' : 'text-slate-600',
        active: isActive,
        completed: isCompleted,
        time: semester ? this.formatSemesterRange(semester, stage) : undefined,
      };
    });
  }

  private getCurrentStage(periods: ProjectPeriodResponse[]): number | null {
    const activePeriod = periods.find((period) => period.status === 1);
    if (activePeriod) {
      return activePeriod.stage;
    }

    if (!periods.length) {
      return null;
    }

    return Math.min(...periods.map((period) => period.stage));
  }

  private formatSemesterRange(semester: SemesterPublicResponse, stage: number): string {
    const start = this.toDisplayDate(semester.startDate);
    const end = this.toDisplayDate(semester.endDate);

    if (stage === 3 || start === end) {
      return `Ngày công bố ${start}`;
    }

    return `Thời gian đăng ký ${start} - ${end}`;
  }

  private toDisplayDate(value: string): string {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }
}
