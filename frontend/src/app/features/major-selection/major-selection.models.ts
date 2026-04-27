import { ApiResponse, PagedResult } from '../../shared/models/api-response.model';
import type { ProjectPeriodResponse, SemesterPublicResponse } from '../pdt/pdt-time.models';

export type { ProjectPeriodResponse, SemesterPublicResponse } from '../pdt/pdt-time.models';

export type Gd1Role = 'student' | 'lecturer';

export interface Specialization {
  id: string;
  name: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
  icon: string;
  accentIcon: string;
  description: string;
}

export interface LecturerAssignment {
  name: string;
  faculty: string;
  subjectCode: string;
  quota: string;
  color: 'blue' | 'orange' | 'green' | 'purple';
  icon: string;
}

export interface FacultyResponse {
  id: string;
  facultyCode: string | null;
  facultyName: string | null;
}

export interface MajorResponse {
  id: number;
  majorCode: string | null;
  majorName: string | null;
  facultyId: string | null;
}

export interface RegistrationResponse {
  id: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  projectPeriodId: string;
  selectedMajorId: number;
  selectedMajorName?: string;
  status: number; // 0: Pending, 1: Approved, 2: Rejected
  submittedAt: string;
  choices: any[];
}

export interface MajorRegistrationRequest {
  projectPeriodId: string;
  selectedMajorId: number;
  choices: { lecturerId: string; priorityOrder: number }[];
}

export type MajorResponseListApiResponse = ApiResponse<MajorResponse[]>;
export type RegistrationApiResponse = ApiResponse<RegistrationResponse>;
export type RegistrationListApiResponse = ApiResponse<RegistrationResponse[]>;
export type RegistrationPagedApiResponse = ApiResponse<PagedResult<RegistrationResponse>>;
export type ProjectPeriodResponsePagedApiResponse = ApiResponse<PagedResult<ProjectPeriodResponse>>;
export type SemesterListApiResponse = ApiResponse<SemesterPublicResponse[]>;