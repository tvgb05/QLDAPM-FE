import { ApiResponse } from '../../shared/models/api-response.model';

export interface PagedResult<T> {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  rowCount: number;
  firstRowOnPage?: number;
  lastRowOnPage?: number;
  results?: T[] | null;
}

export interface ProjectPeriodResponse {
  id: string;
  name?: string | null;
  description?: string | null;
  academicYear?: string | null;
  stage: number;
  status?: number | null;
  semesterId: string;
}

export interface SemesterPublicResponse {
  id: string;
  code?: string | null;
  name?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface StudentResponse {
  id: string;
  studentCode?: string | null;
  fullName?: string | null;
  appUserId: string;
}

export interface LecturerResponse {
  id: string;
  teacherCode?: string | null;
  fullName?: string | null;
  appUserId: string;
}

export interface ProjectTeamCreateRequest {
  projectPeriodId?: string;
  projectTopicId?: string;
  teamName: string;
  memberStudentIds?: string[] | null;
}

export interface ProjectTeamUpdateRequest {
  teamName?: string | null;
  status?: number | null;
}

export interface ProjectTeamResponse {
  id: string;
  projectPeriodId: string;
  projectTopicId: string;
  teamName?: string | null;
  status: number;
}

export interface ProjectTopicCreateRequest {
  projectTeamId: string;
  teacherId: string;
  title: string;
  description?: string | null;
}

export interface ProjectTopicUpdateRequest {
  title?: string | null;
  description?: string | null;
  status?: number | null;
}

export interface ProjectTopicResponse {
  id: string;
  projectTeamId: string;
  teacherId: string;
  title?: string | null;
  description?: string | null;
  status: number;
  approvedBy?: string | null;
}

export interface ProgressReportAttachmentRequest {
  fileName: string;
  fileUrl: string;
}

export interface ProgressReportCreateRequest {
  projectTeamId: string;
  projectTopicId: string;
  title: string;
  summary: string;
  attachments: ProgressReportAttachmentRequest[];
}

export interface ProgressReportResponse {
  id: string;
  projectTeamId: string;
  projectTopicId: string;
  title?: string | null;
  summary?: string | null;
  attachments?: ProgressReportAttachmentRequest[] | null;
}

export interface FinalSubmissionCreateRequest {
  projectTeamId: string;
  projectTopicId: string;
  reportTitle: string;
  attachments: ProgressReportAttachmentRequest[];
}

export interface FinalSubmissionResponse {
  id: string;
  projectTeamId: string;
  projectTopicId: string;
  reportTitle?: string | null;
  attachments?: ProgressReportAttachmentRequest[] | null;
}

export type ProjectPeriodResponsePagedApiResponse = ApiResponse<PagedResult<ProjectPeriodResponse>>;
export type SemesterListApiResponse = ApiResponse<SemesterPublicResponse[]>;
export type StudentResponsePagedApiResponse = ApiResponse<PagedResult<StudentResponse>>;
export type LecturerResponsePagedApiResponse = ApiResponse<PagedResult<LecturerResponse>>;
export type ProjectTeamResponseApiResponse = ApiResponse<ProjectTeamResponse>;
export type ProjectTopicResponseApiResponse = ApiResponse<ProjectTopicResponse>;
export type ProgressReportResponseApiResponse = ApiResponse<ProgressReportResponse>;
export type ProgressReportResponsePagedApiResponse = ApiResponse<PagedResult<ProgressReportResponse>>;
export type FinalSubmissionResponseApiResponse = ApiResponse<FinalSubmissionResponse>;
