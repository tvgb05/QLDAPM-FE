import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { ApiService } from '../../../shared/services/api.service';
import { ReportSection } from '../pdt.models';
import {
  TrainingResultApiResponse,
  TrainingResultCreateRequest,
  TrainingResultResponse,
} from '../pdt-result.models';

@Injectable({
  providedIn: 'root',
})
export class PdtResultService {
  constructor(private readonly apiService: ApiService) {}

  loadReportSections(sections: ReportSection[]): Observable<ReportSection[]> {
    const teamIds = sections
      .flatMap((section) => section.rows)
      .map((row) => row.teamId)
      .filter((teamId): teamId is string => !!teamId);

    if (!teamIds.length) {
      return of(sections);
    }

    return forkJoin(
      teamIds.map((teamId) =>
        this.apiService
          .get<TrainingResultApiResponse>(`/TrainingOfficeResult/team/${teamId}`)
          .pipe(catchError(() => of({ data: null } as TrainingResultApiResponse)))
      )
    ).pipe(
      map((responses) => {
        const resultMap = new Map<string, TrainingResultResponse>();

        responses.forEach((response) => {
          const result = response.data;
          if (result?.projectTeamId) {
            resultMap.set(result.projectTeamId, result);
          }
        });

        return sections.map((section) => ({
          ...section,
          rows: section.rows.map((row) => {
            const result = row.teamId ? resultMap.get(row.teamId) : undefined;
            if (!result) {
              return row;
            }

            return {
              ...row,
              finalScore: result.finalScore,
              grade: result.grade,
              isPassed: result.isPassed,
              status: result.isPassed ? 'Đạt' : 'Không đạt',
              statusClass: result.isPassed
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700',
            };
          }),
        }));
      })
    );
  }

  createTrainingResult(
    payload: TrainingResultCreateRequest
  ): Observable<TrainingResultApiResponse> {
    return this.apiService.post<TrainingResultApiResponse>('/TrainingOfficeResult', payload);
  }
}
