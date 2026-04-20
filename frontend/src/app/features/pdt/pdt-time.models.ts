import { ApiResponse } from '../../shared/models/api-response.model';

export interface ProjectPeriodResponse {
  id: string;
  name: string | null;
  description: string | null;
  academicYear: string | null;
  stage: number;
  status: number;
  semesterId: string;
}

export interface SemesterPublicResponse {
  id: string;
  code: string | null;
  name: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SemesterUpdateRequest {
  code?: string | null;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean | null;
}

export interface SemesterCreateRequest {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface ProjectPeriodCreateRequest {
  name: string;
  description?: string | null;
  academicYear: string;
  stage?: number | null;
  semesterId?: string | null;
}

export interface TimeConfigForm {
  stage1StartDate: string;
  stage1EndDate: string;
  stage2StartDate: string;
  stage2EndDate: string;
  stage3PublishDate: string;
}

export type ProjectPeriodListApiResponse = ApiResponse<ProjectPeriodResponse[]>;
export type ProjectPeriodApiResponse = ApiResponse<ProjectPeriodResponse>;
export type SemesterListApiResponse = ApiResponse<SemesterPublicResponse[]>;
export type SemesterApiResponse = ApiResponse<SemesterPublicResponse>;
