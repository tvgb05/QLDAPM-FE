import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';

import { AuthResponse } from '../../../shared/models/auth-response.model';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { TimelineStep } from '../../../shared/models/ui.models';
import { ApiService } from '../../../shared/services/api.service';
import {
  FacultyResponse,
  GroupItem,
  LecturerResponse,
  LecturerResponsePagedApiResponse,
  MajorResponse,
  MajorResponsePagedApiResponse,
  ProjectPeriodResponse,
  ProjectPeriodResponsePagedApiResponse,
  RegistrationCreateRequest,
  RegistrationItem,
  RegistrationResponse,
  RegistrationResponseApiResponse,
  RegistrationResponsePagedApiResponse,
  RegistrationUpdateRequest,
  SemesterListApiResponse,
  SemesterPublicResponse,
  StudentResponse,
  StudentResponsePagedApiResponse,
} from '../lecturer-selection.models';

@Injectable({
  providedIn: 'root',
})
export class LecturerSelectionService {
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
    timeline: TimelineStep[];
    registrations: RegistrationItem[];
    studentId: string | null;
    projectPeriodId: string | null;
    selectedMajorId: number | null;
    existingRegistrationId: string | null;
    currentMajorName: string | null;
    currentMajorTag: string | null;
  }> {
    if (!currentUser) {
      return of({
        timeline: [],
        registrations: [],
        studentId: null,
        projectPeriodId: null,
        selectedMajorId: null,
        existingRegistrationId: null,
        currentMajorName: null,
        currentMajorTag: null,
      });
    }

    return forkJoin({
      lecturersResponse: this.apiService.get<LecturerResponsePagedApiResponse>(
        '/AppLecturer/paging?PageIndex=1&PageSize=200'
      ),
      facultiesResponse: this.apiService.get<ApiResponse<{ results?: FacultyResponse[] | null }>>(
        '/AppFaculty/paging?PageIndex=1&PageSize=100'
      ),
      majorsResponse: this.apiService.get<MajorResponsePagedApiResponse>(
        '/AppMajor/paging?PageIndex=1&PageSize=100'
      ),
      studentsResponse: this.apiService.get<StudentResponsePagedApiResponse>(
        '/AppStudent/paging?PageIndex=1&PageSize=200'
      ),
      registrationsResponse: this.apiService.get<RegistrationResponsePagedApiResponse>(
        '/StudentProjectRegistration/paging?PageIndex=1&PageSize=200'
      ),
      periodsResponse: this.apiService.get<ProjectPeriodResponsePagedApiResponse>(
        '/ProjectPeriod/paging?PageIndex=1&PageSize=20'
      ),
      semestersResponse: this.apiService.get<SemesterListApiResponse>('/Semester/public-data'),
    }).pipe(
      map(
        ({
          lecturersResponse,
          facultiesResponse,
          majorsResponse,
          studentsResponse,
          registrationsResponse,
          periodsResponse,
          semestersResponse,
        }) => {
          const lecturers = lecturersResponse.data?.results ?? [];
          const faculties = facultiesResponse.data?.results ?? [];
          const majors = majorsResponse.data?.results ?? [];
          const students = studentsResponse.data?.results ?? [];
          const registrations = registrationsResponse.data?.results ?? [];
          const periods = periodsResponse.data?.results ?? [];
          const semesters = semestersResponse.data ?? [];

          const currentStudent =
            students.find((student) => student.appUserId === currentUser.id) ?? null;
          const stageTwoPeriod = periods.find((period) => period.stage === 2) ?? null;
          const currentRegistration =
            currentStudent && stageTwoPeriod
              ? registrations.find(
                  (registration) =>
                    registration.studentId === currentStudent.id &&
                    registration.projectPeriodId === stageTwoPeriod.id
                ) ?? null
              : null;

          const selectedMajorId =
            currentRegistration?.selectedMajorId ?? currentStudent?.majorId ?? null;
          const selectedMajor =
            selectedMajorId != null ? majors.find((major) => major.id === selectedMajorId) ?? null : null;

          return {
            timeline: this.mapTimeline(periods, semesters),
            registrations: this.mapLecturerRegistrations(lecturers, faculties),
            studentId: currentStudent?.id ?? null,
            projectPeriodId: stageTwoPeriod?.id ?? null,
            selectedMajorId,
            existingRegistrationId: currentRegistration?.id ?? null,
            currentMajorName: selectedMajor?.majorName ?? null,
            currentMajorTag: selectedMajor ? this.toMajorTag(selectedMajor.majorName) : null,
          };
        }
      )
    );
  }

  loadLecturerContext(currentUser: AuthResponse | null): Observable<{
    timeline: TimelineStep[];
    pendingGroups: GroupItem[];
    acceptedGroups: GroupItem[];
    currentLecturerId: string | null;
  }> {
    if (!currentUser) {
      return of({
        timeline: [],
        pendingGroups: [],
        acceptedGroups: [],
        currentLecturerId: null,
      });
    }

    return forkJoin({
      lecturersResponse: this.apiService.get<LecturerResponsePagedApiResponse>(
        '/AppLecturer/paging?PageIndex=1&PageSize=200'
      ),
      studentsResponse: this.apiService.get<StudentResponsePagedApiResponse>(
        '/AppStudent/paging?PageIndex=1&PageSize=200'
      ),
      majorsResponse: this.apiService.get<MajorResponsePagedApiResponse>(
        '/AppMajor/paging?PageIndex=1&PageSize=100'
      ),
      registrationsResponse: this.apiService.get<RegistrationResponsePagedApiResponse>(
        '/StudentProjectRegistration/paging?PageIndex=1&PageSize=200'
      ),
      periodsResponse: this.apiService.get<ProjectPeriodResponsePagedApiResponse>(
        '/ProjectPeriod/paging?PageIndex=1&PageSize=20'
      ),
      semestersResponse: this.apiService.get<SemesterListApiResponse>('/Semester/public-data'),
    }).pipe(
      map(
        ({
          lecturersResponse,
          studentsResponse,
          majorsResponse,
          registrationsResponse,
          periodsResponse,
          semestersResponse,
        }) => {
          const lecturers = lecturersResponse.data?.results ?? [];
          const students = studentsResponse.data?.results ?? [];
          const majors = majorsResponse.data?.results ?? [];
          const registrations = registrationsResponse.data?.results ?? [];
          const periods = periodsResponse.data?.results ?? [];
          const semesters = semestersResponse.data ?? [];

          const currentLecturer =
            lecturers.find((lecturer) => lecturer.appUserId === currentUser.id) ?? null;
          const stageTwoPeriod = periods.find((period) => period.stage === 2) ?? null;
          const stageTwoRegistrations = stageTwoPeriod
            ? registrations.filter((registration) => registration.projectPeriodId === stageTwoPeriod.id)
            : registrations;

          return {
            timeline: this.mapTimeline(periods, semesters),
            pendingGroups: this.mapLecturerGroups(stageTwoRegistrations, students, majors),
            acceptedGroups: [],
            currentLecturerId: currentLecturer?.id ?? null,
          };
        }
      )
    );
  }

  saveRegistration(payload: RegistrationCreateRequest): Observable<RegistrationResponseApiResponse> {
    return this.apiService.post<RegistrationResponseApiResponse>('/StudentProjectRegistration', payload);
  }

  updateRegistration(
    registrationId: string,
    payload: RegistrationUpdateRequest
  ): Observable<RegistrationResponseApiResponse> {
    return this.apiService.put<RegistrationResponseApiResponse>(
      `/StudentProjectRegistration/${registrationId}`,
      payload
    );
  }

  createReviewHistory(
    registrationId: string,
    reviewedByUserId: string | null,
    rejectReason: string | null
  ): Observable<ApiResponse<{ id: string }>> {
    return this.apiService.post<ApiResponse<{ id: string }>>(
      `/StudentProjectRegistration/${registrationId}/review`,
      {
        registrationId,
        reviewedByUserId,
        rejectReason,
      }
    );
  }

  private mapLecturerRegistrations(
    lecturers: LecturerResponse[],
    faculties: FacultyResponse[]
  ): RegistrationItem[] {
    const facultyMap = new Map(faculties.map((faculty) => [faculty.id, faculty.facultyName]));

    return lecturers.map((lecturer, index) => {
      const tone = this.getTone(index);
      const lecturerName = lecturer.fullName?.trim() || lecturer.teacherCode?.trim() || 'Chưa có tên';
      const facultyName =
        (lecturer.facultyId != null ? facultyMap.get(lecturer.facultyId) : null) ?? 'Chưa có khoa';

      return {
        id: lecturer.id,
        initials: this.toInitials(lecturerName),
        lecturer: lecturerName,
        tag: lecturer.teacherCode?.trim() || this.toMajorTag(facultyName),
        specialty: facultyName,
        quotaLabel: 'Thông tin',
        quotaValue: lecturer.email?.trim() || lecturer.phoneNumber?.trim() || 'Chưa có',
        progress: 0,
        progressClass: 'bg-slate-300',
        tone,
        full: false,
        registered: false,
        showQuota: false,
      };
    });
  }

  private mapLecturerGroups(
    registrations: RegistrationResponse[],
    students: StudentResponse[],
    majors: MajorResponse[]
  ): GroupItem[] {
    const studentMap = new Map(students.map((student) => [student.id, student]));
    const majorMap = new Map(majors.map((major) => [major.id, major]));

    return registrations.map((registration, index) => {
      const student = studentMap.get(registration.studentId) ?? null;
      const major =
        majorMap.get(registration.selectedMajorId) ??
        (student?.majorId != null ? majorMap.get(student.majorId) : null) ??
        null;
      const studentName = student?.fullName?.trim() || student?.studentCode?.trim() || 'Chưa có tên';

      return {
        registrationId: registration.id,
        name: studentName,
        studentId: student?.studentCode?.trim() || registration.studentId,
        specialization: major?.majorName?.trim() || 'Chưa có chuyên ngành',
        initials: this.toInitials(studentName),
        tone: this.getTone(index),
        decision: 'none',
        backendStatus: registration.status,
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
      const isActive = currentStage !== null ? stage === currentStage : stage === 2;

      return {
        step: String(stage),
        title: `Giai đoạn ${stage}`,
        subtitle:
          stage === 1
            ? 'Chọn hướng chuyên ngành'
            : stage === 2
              ? 'Đăng ký GVHD'
              : 'Thực hiện Đồ án',
        badge: this.getStageBadge(isCompleted, isActive),
        badgeClass: this.getStageBadgeClass(isCompleted, isActive),
        textClass: isActive ? 'text-blue-700' : 'text-slate-600',
        subtitleClass: isActive ? 'text-slate-500 mb-1' : 'text-slate-400 mb-1',
        stepNumberClass: isActive ? 'text-slate-500' : undefined,
        active: isActive,
        completed: isCompleted,
        time: semester ? this.formatSemesterRange(semester, stage) : undefined,
        children:
          stage === 3
            ? [
                { title: 'Phân công chính thức' },
                { title: 'Báo cáo tiến độ 1', muted: true },
                { title: 'Báo cáo tiến độ 2', muted: true },
                { title: 'Nộp đồ án', muted: true },
                { title: 'Bảo vệ Hội đồng', emphasis: true, outlined: true },
              ]
            : undefined,
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

  private getStageBadge(isCompleted: boolean, isActive: boolean): string {
    if (isCompleted) {
      return 'Hoàn thành';
    }

    if (isActive) {
      return 'Đang diễn ra';
    }

    return 'Sắp tới';
  }

  private getStageBadgeClass(isCompleted: boolean, isActive: boolean): string {
    if (isCompleted) {
      return 'bg-green-50 text-green-700 border border-green-100';
    }

    if (isActive) {
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    }

    return 'bg-slate-100 text-slate-500 border border-slate-200';
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

  private toInitials(value: string): string {
    const words = value
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);

    return words
      .slice(-2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('');
  }

  private toMajorTag(value: string): string {
    return value
      .split(/\s+/)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 4);
  }

  private getTone(index: number): RegistrationItem['tone'] {
    const tones: RegistrationItem['tone'][] = ['blue', 'purple', 'slate'];
    return tones[index % tones.length];
  }
}
