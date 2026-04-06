import { ApiResponse } from '../../shared/models/api-response.model';

export interface ProjectTopicResponse {
  id: string;
  projectTeamId: string;
  teacherId: string;
  title: string | null;
  description: string | null;
  status: number;
  approvedBy: string | null;
}

export interface ProjectTopicCreateRequest {
  projectTeamId: string;
  teacherId: string;
  title: string;
  description: string | null;
}

export interface LecturerResponse {
  id: string;
  teacherCode: string | null;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  appUserId: string;
  facultyId: number | null;
}

export interface FacultyResponse {
  id: number;
  ssoFacultyId: number;
  courseId: number | null;
  facultyName: string | null;
  lastSyncedAt: string;
}

export interface ProjectTeamResponse {
  id: string;
  projectPeriodId: string;
  projectTopicId: string;
  teamName: string | null;
  status: number;
}

export interface PagedResult<T> {
  results: T[] | null;
  currentPage: number;
  pageCount: number;
  pageSize: number;
  rowCount: number;
  firstRowOnPage: number;
  lastRowOnPage: number;
}

export interface TopicTableItem {
  id: string;
  teamId: string;
  teamName: string;
  title: string;
  lecturerName: string;
  description: string;
}

export interface TopicFormOption {
  id: string;
  label: string;
}

export interface TopicManagementContext {
  topics: TopicTableItem[];
  teams: TopicFormOption[];
  lecturers: TopicFormOption[];
}

export type ProjectTopicPagedApiResponse = ApiResponse<PagedResult<ProjectTopicResponse>>;
export type LecturerPagedApiResponse = ApiResponse<PagedResult<LecturerResponse>>;
export type ProjectTeamPagedApiResponse = ApiResponse<PagedResult<ProjectTeamResponse>>;
export type ProjectTopicResponseApiResponse = ApiResponse<ProjectTopicResponse>;
