import { Injectable } from '@angular/core';
import { catchError, combineLatest, forkJoin, map, Observable, of } from 'rxjs';

import { ApiResponse } from '../../../shared/models/api-response.model';
import { TimelineStep } from '../../../shared/models/ui.models';
import { ApiService } from '../../../shared/services/api.service';
import { TimeContextService } from '../../../shared/services/time-context.service';
import { AuthResponse } from '../../../shared/models/auth-response.model';
import {
  FacultyResponse,
  RegistrationApiResponse,
  MajorRegistrationRequest,
  RegistrationPagedApiResponse,
  MajorResponse,
  MajorResponseListApiResponse,
  ProjectPeriodResponse,
  ProjectPeriodResponsePagedApiResponse,
  SemesterListApiResponse,
  SemesterPublicResponse,
  Specialization,
} from '../major-selection.models';

@Injectable({
  providedIn: 'root',
})
export class MajorSelectionService {
  constructor(
    private readonly apiService: ApiService,
    private readonly timeContext: TimeContextService
  ) { }

  loadBaseStudentContext(): Observable<{
    specializations: Specialization[];
    timeline: TimelineStep[];
    projectPeriodId: string | null;
  }> {
    return combineLatest({
      majors: this.timeContext.majors$,
      periods: this.timeContext.allPeriodsInSemester$,
      activePeriod: this.timeContext.activePeriod$,
      activeSemester: this.timeContext.activeSemester$,
      facultiesResponse: this.apiService.get<ApiResponse<{ results: FacultyResponse[] }>>(
        '/AppFaculty/paging?PageIndex=1&PageSize=100'
      ),
    }).pipe(
      map(({ majors, periods, activePeriod, activeSemester, facultiesResponse }) => {
        const faculties = facultiesResponse.data?.results ?? [];
        const semesters = activeSemester ? [activeSemester] : [];

        return {
          specializations: this.mapSpecializations(majors, faculties),
          timeline: this.mapTimeline(periods, semesters),
          projectPeriodId: activePeriod?.id ?? null,
        };
      })
    );
  }

  saveStudentSpecialization(payload: MajorRegistrationRequest): Observable<RegistrationApiResponse> {
    return this.apiService.post<RegistrationApiResponse>('/student-registrations', payload);
  }

  cancelStudentSelection(majorId: number): Observable<ApiResponse<string>> {
    return this.apiService.delete<ApiResponse<string>>(`/student-registrations/my-registration?majorId=${majorId}`);
  }

  getAllRegistrations(
    pageIndex: number = 1,
    pageSize: number = 20,
    searchTerm: string = '',
    semesterId?: string
  ): Observable<RegistrationPagedApiResponse> {
    let url = `/student-registrations?PageIndex=${pageIndex}&PageSize=${pageSize}&SearchTerm=${searchTerm}`;
    if (semesterId) {
      url += `&semesterId=${semesterId}`;
    }
    return this.apiService.get<RegistrationPagedApiResponse>(url);
  }

  loadStudentSelection(
    currentUser: AuthResponse | null,
    projectPeriodId: string | null
  ): Observable<{
    studentId: string | null;
    selectedMajorId: string | null;
  }> {
    if (!currentUser || !projectPeriodId) {
      return of({
        studentId: null,
        selectedMajorId: null,
      });
    }

    return this.apiService
      .get<any>('/student-registrations/my-registration')
      .pipe(
        map((response) => {
          console.log('my-registration response:', response);
          // The API might return an array or a single object
          const data = response.data;
          const registration = Array.isArray(data) ? data[0] : data;

          return {
            studentId: currentUser.id,
            selectedMajorId: registration?.selectedMajorId?.toString() ?? null,
          };
        }),
        catchError(() =>
          of({
            studentId: currentUser.id,
            selectedMajorId: null,
          })
        )
      );
  }

  private mapSpecializations(majors: MajorResponse[], faculties: FacultyResponse[]): Specialization[] {
    const facultyMap = new Map(faculties.map((faculty) => [faculty.id, faculty]));

    return majors.map((major, index) => {
      const themes = [
        { color: 'blue', icon: 'code', accentIcon: 'layoutTemplate' },
        { color: 'orange', icon: 'server', accentIcon: 'database' },
        { color: 'green', icon: 'globe', accentIcon: 'shieldCheck' },
        { color: 'purple', icon: 'cpu', accentIcon: 'brainCircuit' },
      ] as const;
      const theme = themes[index % themes.length];
      const facultyName =
        (major.facultyId != null ? facultyMap.get(major.facultyId)?.facultyName : null) ??
        'Chưa có khoa';

      return {
        id: major.id.toString(),
        name: major.majorName?.trim() || 'Chưa có tên chuyên ngành',
        color: theme.color,
        icon: theme.icon,
        accentIcon: theme.accentIcon,
        description: `${major.majorName?.trim() || 'Chuyên ngành'} thuộc ${facultyName}.`,
      };
    });
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
      const isActive = currentStage !== null ? stage === currentStage : stage === 1;

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
}
