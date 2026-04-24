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

export interface Gd1RegistrationResponse {
  id: string;
  studentId: string;
  projectPeriodId: string;
  selectedMajorId: number;
  choices: any[];
}

export interface MajorRegistrationRequest {
  studentId: string;
  projectPeriodId: string;
  selectedMajorId: number;
  choices: any[];
}

export type MajorResponseListApiResponse = ApiResponse<MajorResponse[]>;
export type Gd1RegistrationApiResponse = ApiResponse<Gd1RegistrationResponse>;
export type Gd1RegistrationPagedApiResponse = ApiResponse<PagedResult<Gd1RegistrationResponse>>;
export type ProjectPeriodResponsePagedApiResponse = ApiResponse<PagedResult<ProjectPeriodResponse>>;
export type SemesterListApiResponse = ApiResponse<SemesterPublicResponse[]>;