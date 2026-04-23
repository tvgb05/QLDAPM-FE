import { ApiResponse, PagedResult } from '../../shared/models/api-response.model';

export enum ProjectPeriodType {
  MajorSelection = 10,
  LecturerSelection = 20,
  LecturerReview = 25,
  ProjectExecution = 30,
  FinalDefense = 40,
}

export interface ProjectPeriodResponse {
  id: string;
  name: string | null;
  description: string | null;
  academicYear: string | null;
  stage: number;
  status: number;
  semesterId: string;
  type: ProjectPeriodType;
  startDate: string;
  endDate: string;
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
  semesterId: string;
  type: number;
  startDate: string;
  endDate: string;
  status?: number;
}

export interface ProjectPeriodUpdateRequest {
  name?: string | null;
  description?: string | null;
  academicYear?: string | null;
  stage?: number | null;
  type?: number;
  startDate?: string;
  endDate?: string;
  status?: number;
}

export interface SemesterGetPagingRequest {
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
}

export interface ProjectGetPagingRequest {
  pageIndex: number;
  pageSize: number;
  searchTerm?: string;
  semesterId?: string;
}

export type ProjectPeriodListApiResponse = ApiResponse<ProjectPeriodResponse[]>;
export type ProjectPeriodApiResponse = ApiResponse<ProjectPeriodResponse>;
export type ProjectPeriodPagedApiResponse = ApiResponse<PagedResult<ProjectPeriodResponse>>;
export type SemesterListApiResponse = ApiResponse<SemesterPublicResponse[]>;
export type SemesterApiResponse = ApiResponse<SemesterPublicResponse>;
export type SemesterPagedApiResponse = ApiResponse<PagedResult<SemesterPublicResponse>>;

// Legacy form compatibility (can be removed later if not needed)
export interface TimeConfigForm {
  stage1StartDate: string;
  stage1EndDate: string;
  stage2StartDate: string;
  stage2EndDate: string;
  stage3PublishDate: string;
}
