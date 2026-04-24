import { AppRole, TimelineStep } from '../../shared/models/ui.models';
import { ApiResponse } from '../../shared/models/api-response.model';

export type SelectionTab = 'pending' | 'accepted';
export type LecturerCardTone = 'blue' | 'purple' | 'slate';
export type RequestDecision = 'none' | 'approved' | 'rejected';

export interface RegistrationItem {
  id: string;
  initials: string;
  lecturer: string;
  tag: string;
  specialty: string;
  quotaLabel: string;
  quotaValue: string;
  progress: number;
  progressClass: string;
  tone: LecturerCardTone;
  full: boolean;
  registered: boolean;
  showQuota?: boolean;
}

export interface GroupItem {
  registrationId?: string;
  name: string;
  studentId: string;
  specialization: string;
  initials: string;
  tone: LecturerCardTone;
  decision: RequestDecision;
  backendStatus?: number | null;
}

export interface PagedResult<T> {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  rowCount: number;
  firstRowOnPage?: number;
  lastRowOnPage?: number;
  results?: T[] | null;
}

export interface LecturerResponse {
  id: string;
  teacherCode?: string | null;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  appUserId: string;
  facultyId?: number | null;
}

export interface MajorResponse {
  id: number;
  ssoMajorId: number;
  facultyId?: number | null;
  majorName: string;
}

export interface FacultyResponse {
  id: number;
  facultyName: string;
}

export interface StudentResponse {
  id: string;
  studentCode?: string | null;
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  appUserId: string;
  facultyId?: number | null;
  majorId?: number | null;
  classGroupId?: string | null;
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
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface RegistrationChoiceRequest {
  lecturerId: string;
  priorityOrder: number;
}

export interface RegistrationCreateRequest {
  studentId: string;
  projectPeriodId: string;
  selectedMajorId: number;
  choices?: RegistrationChoiceRequest[] | null;
}

export interface RegistrationUpdateRequest {
  status?: number | null;
  approvedLecturerId?: string | null;
  rejectReason?: string | null;
}

export interface RegistrationResponse {
  id: string;
  studentId: string;
  projectPeriodId: string;
  selectedMajorId: number;
  submittedAt?: string | null;
  status: number;
}

export type LecturerResponsePagedApiResponse = ApiResponse<PagedResult<LecturerResponse>>;
export type MajorResponsePagedApiResponse = ApiResponse<PagedResult<MajorResponse>>;
export type StudentResponsePagedApiResponse = ApiResponse<PagedResult<StudentResponse>>;
export type ProjectPeriodResponsePagedApiResponse = ApiResponse<PagedResult<ProjectPeriodResponse>>;
export type RegistrationResponsePagedApiResponse = ApiResponse<PagedResult<RegistrationResponse>>;
export type RegistrationResponseApiResponse = ApiResponse<RegistrationResponse>;
export type SemesterListApiResponse = ApiResponse<SemesterPublicResponse[]>;
