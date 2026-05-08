import { AppRole, TimelineStep } from '../../shared/models/ui.models';
import { ApiResponse } from '../../shared/models/api-response.model';

export type SelectionTab = 'pending' | 'accepted';
export type LecturerCardTone = 'blue' | 'purple' | 'slate';
export type RequestDecision = 'none' | 'approved' | 'rejected';

/** Status: 0 = Pending, 1 = Approved, 2 = Rejected */
export type RegistrationStatus = 0 | 1 | 2;

export interface RegistrationChoiceResponse {
  id: string;
  registrationId: string;
  lecturerId: string;
  lecturerName?: string | null;
  priorityOrder: number;
  status: number;
}

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
  status?: number | null;
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
  choices?: RegistrationChoiceResponse[] | null;
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
  isDelete?: boolean;
}

export interface MajorResponse {
  id: number;
  ssoMajorId: number;
  facultyId?: number | null;
  majorName: string;
}

export interface FacultyResponse {
  id: number;
  facultyCode?: string | null;
  facultyName: string | null;
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

export interface SupervisorRegistrationCreateRequest {
  lecturerId: string;
}

export interface SupervisorApproveRequest {
  approvedLecturerId: string;
}

export interface SupervisorRejectRequest {
  rejectReason?: string | null;
}

export interface RegistrationResponse {
  id: string;
  studentId: string;
  studentName?: string | null;
  studentCode?: string | null;
  projectPeriodId: string;
  selectedMajorId: number;
  majorId?: number;
  selectedMajorName?: string | null;
  submittedAt?: string | null;
  status: number;
  rejectReason?: string | null;
  approvedLecturerId?: string | null;
  approvedLecturerName?: string | null;
  reviewedAt?: string | null;
  choices?: RegistrationChoiceResponse[] | null;
}

export type LecturerResponsePagedApiResponse = ApiResponse<PagedResult<LecturerResponse>>;
export type MajorResponsePagedApiResponse = ApiResponse<PagedResult<MajorResponse>>;
export type StudentResponsePagedApiResponse = ApiResponse<PagedResult<StudentResponse>>;
export type ProjectPeriodResponsePagedApiResponse = ApiResponse<PagedResult<ProjectPeriodResponse>>;
export type RegistrationResponsePagedApiResponse = ApiResponse<PagedResult<RegistrationResponse>>;
export type RegistrationResponseApiResponse = ApiResponse<RegistrationResponse>;
export type RegistrationListApiResponse = ApiResponse<RegistrationResponse[]>;
export type SemesterListApiResponse = ApiResponse<SemesterPublicResponse[]>;
