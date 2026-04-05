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
  title: string;
  code: string;
  faculty: string;
  facultyClass: string;
  lecturers: string[];
}

export type ProjectTopicListApiResponse = ApiResponse<ProjectTopicResponse[]>;
export type LecturerPagedApiResponse = ApiResponse<PagedResult<LecturerResponse>>;
export type FacultyListApiResponse = ApiResponse<FacultyResponse[]>;
