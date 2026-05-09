import { ApiResponse } from '../../shared/models/api-response.model';

export interface ProjectTeamResponse {
  id: string;
  projectPeriodId: string;
  teamCode: string;
  teamName: string | null;
  leaderStudentId: string | null;
  leaderStudentName: string | null;
  assignedLecturerId: string | null;
  assignedLecturerName: string | null;
  status: number;
  maxMembers: number;
  members: TeamMemberResponse[];
}

export interface TeamMemberResponse {
  id: string;
  projectTeamId: string;
  studentId: string;
  studentName: string | null;
  studentCode: string | null;
  role: number; // 1: Leader, 2: Member
  isActiveMember: boolean;
  status: number; // 0: Invited, 1: Accepted, 2: Declined, 3: Left
  joinedAt: string;
  teamName: string | null;
  teamCode: string | null;
}

export interface TeamCreateByStudentRequest {
  teamName: string | null;
}

export interface TeamInviteRequest {
  studentCode: string;
}

export interface TeamInviteRespondRequest {
  teamId: string;
  accept: boolean;
}

export type ProjectTeamApiResponse = ApiResponse<ProjectTeamResponse>;
export type TeamMemberInviteListApiResponse = ApiResponse<TeamMemberResponse[]>;
export type BooleanApiResponse = ApiResponse<boolean>;
