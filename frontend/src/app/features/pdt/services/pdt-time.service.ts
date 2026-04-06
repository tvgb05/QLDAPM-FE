import { Injectable } from '@angular/core';
import { forkJoin, from, map, Observable, concatMap, switchMap, toArray } from 'rxjs';

import { ApiService } from '../../../shared/services/api.service';
import {
  ProjectPeriodApiResponse,
  ProjectPeriodCreateRequest,
  ProjectPeriodResponse,
  ProjectPeriodListApiResponse,
  SemesterApiResponse,
  SemesterCreateRequest,
  SemesterListApiResponse,
  SemesterPublicResponse,
  SemesterUpdateRequest,
  TimeConfigForm,
} from '../pdt-time.models';

interface TimeConfigContext {
  form: TimeConfigForm;
  periods: ProjectPeriodResponse[];
  semesters: SemesterPublicResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class PdtTimeService {
  constructor(private readonly apiService: ApiService) {}

  loadTimeConfig(): Observable<TimeConfigContext> {
    return forkJoin({
      periodsResponse: this.apiService.get<ProjectPeriodListApiResponse>(
        '/ProjectPeriod/public-data'
      ),
      semestersResponse: this.apiService.get<SemesterListApiResponse>('/Semester/public-data'),
    }).pipe(
      map(({ periodsResponse, semestersResponse }) => {
        const periods = periodsResponse.data ?? [];
        const semesters = semestersResponse.data ?? [];

        return {
          form: this.buildForm(periods, semesters),
          periods,
          semesters,
        };
      })
    );
  }

  saveTimeConfig(
    form: TimeConfigForm,
    periods: ProjectPeriodResponse[],
    semesters: SemesterPublicResponse[]
  ): Observable<SemesterApiResponse[]> {
    return this.loadSnapshot().pipe(
      switchMap((snapshot) => {
        const latestPeriods = snapshot.periods.length ? snapshot.periods : periods;
        const latestSemesters = snapshot.semesters.length ? snapshot.semesters : semesters;
        const semesterMap = new Map(latestSemesters.map((semester) => [semester.id, semester]));
        const periodsByStage = new Map(latestPeriods.map((period) => [period.stage, period]));
        const stageConfigs = this.buildStageConfigs(form);

        return from(stageConfigs).pipe(
          concatMap((stageConfig) =>
            this.saveStageConfig(stageConfig, periodsByStage, semesterMap)
          ),
          toArray()
        );
      })
    );
  }

  private loadSnapshot(): Observable<Pick<TimeConfigContext, 'periods' | 'semesters'>> {
    return forkJoin({
      periodsResponse: this.apiService.get<ProjectPeriodListApiResponse>(
        '/ProjectPeriod/public-data'
      ),
      semestersResponse: this.apiService.get<SemesterListApiResponse>('/Semester/public-data'),
    }).pipe(
      map(({ periodsResponse, semestersResponse }) => ({
        periods: periodsResponse.data ?? [],
        semesters: semestersResponse.data ?? [],
      }))
    );
  }

  private saveStageConfig(
    config: StageConfig,
    periodsByStage: Map<number, ProjectPeriodResponse>,
    semesterMap: Map<string, SemesterPublicResponse>
  ): Observable<SemesterApiResponse> {
    const existingPeriod = periodsByStage.get(config.stage);

    if (!existingPeriod) {
      return this.createStageConfig(config).pipe(
        map((response) => response)
      );
    }

    const linkedSemester = semesterMap.get(existingPeriod.semesterId);
    if (!linkedSemester) {
      throw new Error(
        `Không tìm thấy Semester liên kết với Giai đoạn ${config.stage}. Backend cần dữ liệu hợp lệ để cập nhật.`
      );
    }

    return this.apiService.put<SemesterApiResponse>(`/Semester/${linkedSemester.id}`, {
      code: linkedSemester.code,
      name: linkedSemester.name,
      startDate: this.toIsoDate(config.startDate),
      endDate: this.toIsoDate(config.endDate),
      isActive: linkedSemester.isActive,
    });
  }

  private createStageConfig(config: StageConfig): Observable<SemesterApiResponse> {
    const semesterPayload: SemesterCreateRequest = {
      code: this.buildSemesterCode(config.stage),
      name: this.buildSemesterName(config.stage),
      startDate: this.toIsoDate(config.startDate) ?? this.toIsoDate(config.endDate) ?? '',
      endDate: this.toIsoDate(config.endDate) ?? this.toIsoDate(config.startDate) ?? '',
      isActive: true,
    };

    return this.apiService.post<SemesterApiResponse>('/Semester', semesterPayload).pipe(
      switchMap((semesterResponse) => {
        const createdSemester = semesterResponse.data;

        if (!createdSemester?.id) {
          throw new Error(`Không thể tạo Semester cho Giai đoạn ${config.stage}.`);
        }

        const projectPeriodPayload: ProjectPeriodCreateRequest = {
          name: this.buildProjectPeriodName(config.stage),
          description: this.buildProjectPeriodDescription(config.stage),
          academicYear: this.buildAcademicYear(),
          stage: config.stage,
          semesterId: createdSemester.id,
        };

        return this.apiService
          .post<ProjectPeriodApiResponse>('/ProjectPeriod', projectPeriodPayload)
          .pipe(map(() => semesterResponse));
      })
    );
  }

  private buildForm(
    periods: ProjectPeriodResponse[],
    semesters: SemesterPublicResponse[]
  ): TimeConfigForm {
    const semesterMap = new Map(semesters.map((semester) => [semester.id, semester]));
    const stage1 = this.findPeriodByStage(periods, 1);
    const stage2 = this.findPeriodByStage(periods, 2);
    const stage3 = this.findPeriodByStage(periods, 3);

    return {
      stage1StartDate: this.toDateInputValue(semesterMap.get(stage1?.semesterId ?? '')?.startDate),
      stage1EndDate: this.toDateInputValue(semesterMap.get(stage1?.semesterId ?? '')?.endDate),
      stage2StartDate: this.toDateInputValue(semesterMap.get(stage2?.semesterId ?? '')?.startDate),
      stage2EndDate: this.toDateInputValue(semesterMap.get(stage2?.semesterId ?? '')?.endDate),
      stage3PublishDate: this.toDateInputValue(semesterMap.get(stage3?.semesterId ?? '')?.startDate),
    };
  }

  private findPeriodByStage(
    periods: ProjectPeriodResponse[],
    stage: number
  ): ProjectPeriodResponse | undefined {
    return periods.find((period) => period.stage === stage);
  }

  private buildStageConfigs(form: TimeConfigForm): StageConfig[] {
    return [
      {
        stage: 1,
        startDate: form.stage1StartDate,
        endDate: form.stage1EndDate || form.stage1StartDate,
      },
      {
        stage: 2,
        startDate: form.stage2StartDate,
        endDate: form.stage2EndDate || form.stage2StartDate,
      },
      {
        stage: 3,
        startDate: form.stage3PublishDate,
        endDate: form.stage3PublishDate,
      },
    ].filter((config) => !!config.startDate || !!config.endDate);
  }

  private buildAcademicYear(): string {
    const now = new Date();
    const month = now.getMonth() + 1;
    const startYear = month >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}-${startYear + 1}`;
  }

  private buildSemesterCode(stage: number): string {
    return `GD${stage}-${this.buildAcademicYear()}`;
  }

  private buildSemesterName(stage: number): string {
    return `Giai đoạn ${stage} - ${this.buildAcademicYear()}`;
  }

  private buildProjectPeriodName(stage: number): string {
    switch (stage) {
      case 1:
        return 'Giai đoạn 1';
      case 2:
        return 'Giai đoạn 2';
      case 3:
        return 'Giai đoạn 3';
      default:
        return `Giai đoạn ${stage}`;
    }
  }

  private buildProjectPeriodDescription(stage: number): string | null {
    switch (stage) {
      case 1:
        return 'Đăng ký nguyện vọng chuyên ngành đồ án';
      case 2:
        return 'Điều chỉnh và đăng ký lại';
      case 3:
        return 'Thực hiện đồ án';
      default:
        return null;
    }
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }
    return value.slice(0, 10);
  }

  private toIsoDate(value: string): string | null {
    if (!value) {
      return null;
    }
    return `${value}T00:00:00`;
  }
}

interface StageConfig {
  stage: number;
  startDate: string;
  endDate: string;
}
