import { AppIconKey } from '../../shared/icons/app-icons';
import { ApiResponse } from '../../shared/models/api-response.model';
import { AppRole, NotificationItem, TimelineStep } from '../../shared/models/ui.models';

export type Gd1Role = AppRole;

export interface Specialization {
  id: string;
  name: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
  icon: AppIconKey;
  accentIcon: AppIconKey;
  description: string;
}

export interface LecturerAssignment {
  name: string;
  faculty: string;
  subjectCode: string;
  quota: string;
  color: 'blue' | 'purple';
  icon: AppIconKey;
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

export interface MajorResponse {
  id: number;
  ssoMajorId: number;
  facultyId: number | null;
  majorName: string | null;
}

export interface FacultyResponse {
  id: number;
  ssoFacultyId: number;
  courseId: number | null;
  facultyName: string | null;
  lastSyncedAt: string;
}

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

export interface StudentResponse {
  id: string;
  studentCode: string | null;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  appUserId: string;
  facultyId: number | null;
  majorId: number | null;
  classGroupId: string | null;
}

export interface Gd1RegistrationChoiceRequest {
  lecturerId: string;
  priorityOrder: number;
}

export interface Gd1RegistrationResponse {
  id: string;
  studentId: string;
  projectPeriodId: string;
  selectedMajorId: number;
  submittedAt: string | null;
  status: number;
}

export interface Gd1RegistrationCreateRequest {
  studentId: string;
  projectPeriodId: string;
  selectedMajorId: number;
  choices: Gd1RegistrationChoiceRequest[];
}

export interface Gd1DataContext {
  specializations: Specialization[];
  timeline: TimelineStep[];
  studentId: string | null;
  projectPeriodId: string | null;
  selectedMajorId: string | null;
}

export type MajorResponsePagedApiResponse = ApiResponse<PagedResult<MajorResponse>>;
export type MajorResponseListApiResponse = ApiResponse<MajorResponse[]>;
export type ProjectPeriodResponsePagedApiResponse = ApiResponse<PagedResult<ProjectPeriodResponse>>;
export type SemesterListApiResponse = ApiResponse<SemesterPublicResponse[]>;
export type StudentResponsePagedApiResponse = ApiResponse<PagedResult<StudentResponse>>;
export type Gd1RegistrationPagedApiResponse = ApiResponse<PagedResult<Gd1RegistrationResponse>>;
export type Gd1RegistrationApiResponse = ApiResponse<Gd1RegistrationResponse>;
