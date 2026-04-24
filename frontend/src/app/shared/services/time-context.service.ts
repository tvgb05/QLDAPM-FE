import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { PdtTimeService } from '../../features/pdt/services/pdt-time.service';
import { ProjectPeriodResponse, ProjectPeriodType, SemesterPublicResponse } from '../../features/pdt/pdt-time.models';
import { MajorResponse } from '../../features/major-selection/major-selection.models';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TimeContextService {
  private readonly activeSemesterSubject = new BehaviorSubject<SemesterPublicResponse | null>(null);
  private readonly activePeriodSubject = new BehaviorSubject<ProjectPeriodResponse | null>(null);
  private readonly allPeriodsInSemesterSubject = new BehaviorSubject<ProjectPeriodResponse[]>([]);
  private readonly majorsSubject = new BehaviorSubject<MajorResponse[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  activeSemester$ = this.activeSemesterSubject.asObservable();
  activePeriod$ = this.activePeriodSubject.asObservable();
  allPeriodsInSemester$ = this.allPeriodsInSemesterSubject.asObservable();
  majors$ = this.majorsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private readonly apiService: ApiService,
    private readonly pdtTimeService: PdtTimeService
  ) {
    this.refreshContext();
  }

  refreshContext(): void {
    this.loadingSubject.next(true);

    // Fetch Majors
    this.fetchMajors();

    // Fetch Semester and Periods
    this.pdtTimeService.getSemestersPublic()
      .pipe(
        switchMap(res => {
          const semesters = res.data || [];
          const activeSemester = this.findActiveSemester(semesters);
          this.activeSemesterSubject.next(activeSemester);

          if (activeSemester) {
            return this.pdtTimeService.getPeriodsPaging({
              pageIndex: 1,
              pageSize: 100,
              semesterId: activeSemester.id
            });
          }
          return of(null);
        }),
        tap(res => {
          if (res?.success && res.data) {
            const periods = res.data.results.sort((a, b) => a.stage - b.stage);
            this.allPeriodsInSemesterSubject.next(periods);

            const activePeriod = this.findActivePeriod(periods);
            this.activePeriodSubject.next(activePeriod);
          }
          this.loadingSubject.next(false);
        })
      )
      .subscribe();
  }

  private fetchMajors(): void {
    this.apiService.get<ApiResponse<{ results: MajorResponse[] }>>('/AppMajor/paging?PageIndex=1&PageSize=100')
      .subscribe(res => {
        if (res.success && res.data) {
          this.majorsSubject.next(res.data.results);
        }
      });
  }

  private findActiveSemester(semesters: SemesterPublicResponse[]): SemesterPublicResponse | null {
    if (!semesters.length) return null;
    const now = new Date();

    // 1. Ưu tiên tìm học kỳ mà hiện tại đang nằm trong khoảng thời gian đó
    const inRange = semesters.find(s => {
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);
      // Đảm bảo so sánh đến hết ngày endDate
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    });

    if (inRange) return inRange;

    // 2. Nếu không có học kỳ nào khớp thời gian, ưu tiên học kỳ có isActive: true
    const activeFlag = semesters.find(s => s.isActive);
    if (activeFlag) return activeFlag;

    // 3. Fallback về học kỳ đầu tiên
    return semesters[0];
  }

  private findActivePeriod(periods: ProjectPeriodResponse[]): ProjectPeriodResponse | null {
    const now = new Date();
    return periods.find(p => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      // Đảm bảo so sánh đến hết ngày endDate
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    }) || null;
  }

  getCurrentType(): ProjectPeriodType | null {
    return this.activePeriodSubject.value?.type || null;
  }
}
