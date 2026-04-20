import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { ApiService } from '../../../shared/services/api.service';
import {
  ProjectPeriodApiResponse,
  ProjectPeriodCreateRequest,
  ProjectPeriodResponse,
  ProjectPeriodListApiResponse,
  ProjectPeriodUpdateRequest,
  SemesterApiResponse,
  SemesterCreateRequest,
  SemesterListApiResponse,
  SemesterPublicResponse,
  SemesterUpdateRequest,
  SemesterGetPagingRequest,
  SemesterPagedApiResponse,
  ProjectGetPagingRequest,
  ProjectPeriodPagedApiResponse,
} from '../pdt-time.models';
import { ApiResponse } from '../../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class PdtTimeService {
  constructor(private readonly apiService: ApiService) {}

  // --- Semester CRUD ---

  getSemestersPublic(): Observable<SemesterListApiResponse> {
    return this.apiService.get<SemesterListApiResponse>('/Semester/public-data');
  }

  getSemestersPaging(params: SemesterGetPagingRequest): Observable<SemesterPagedApiResponse> {
    const query = this.buildQuery(params);
    return this.apiService.get<SemesterPagedApiResponse>(`/Semester/paging${query}`);
  }

  getSemesterById(id: string): Observable<SemesterApiResponse> {
    return this.apiService.get<SemesterApiResponse>(`/Semester/${id}`);
  }

  createSemester(request: SemesterCreateRequest): Observable<SemesterApiResponse> {
    return this.apiService.post<SemesterApiResponse>('/Semester', request);
  }

  updateSemester(id: string, request: SemesterUpdateRequest): Observable<SemesterApiResponse> {
    return this.apiService.put<SemesterApiResponse>(`/Semester/${id}`, request);
  }

  deleteSemester(id: string): Observable<ApiResponse<boolean>> {
    return this.apiService.delete<ApiResponse<boolean>>(`/Semester/${id}`);
  }

  // --- ProjectPeriod CRUD ---

  getPeriodsPublic(): Observable<ProjectPeriodListApiResponse> {
    return this.apiService.get<ProjectPeriodListApiResponse>('/ProjectPeriod/public-data');
  }

  getPeriodsPaging(params: ProjectGetPagingRequest): Observable<ProjectPeriodPagedApiResponse> {
    const query = this.buildQuery(params);
    return this.apiService.get<ProjectPeriodPagedApiResponse>(`/ProjectPeriod/paging${query}`);
  }

  getPeriodById(id: string): Observable<ProjectPeriodApiResponse> {
    return this.apiService.get<ProjectPeriodApiResponse>(`/ProjectPeriod/${id}`);
  }

  createPeriod(request: ProjectPeriodCreateRequest): Observable<ProjectPeriodApiResponse> {
    return this.apiService.post<ProjectPeriodApiResponse>('/ProjectPeriod', request);
  }

  updatePeriod(id: string, request: ProjectPeriodUpdateRequest): Observable<ProjectPeriodApiResponse> {
    return this.apiService.put<ProjectPeriodApiResponse>(`/ProjectPeriod/${id}`, request);
  }

  deletePeriod(id: string): Observable<ApiResponse<boolean>> {
    return this.apiService.delete<ApiResponse<boolean>>(`/ProjectPeriod/${id}`);
  }

  // --- Helpers ---

  private buildQuery(params: any): string {
    const parts = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    return parts.length ? `?${parts.join('&')}` : '';
  }

  // Date utilities (ported from old implementation but simplified)
  toDateInputValue(value?: string | null): string {
    if (!value) return '';
    return value.slice(0, 10);
  }

  toIsoDate(value: string | null): string | null {
    if (!value) return null;
    return `${value}T00:00:00`;
  }
}
