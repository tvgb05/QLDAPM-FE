import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../shared/services/api.service';
import {
  ProjectTeamApiResponse,
  TeamMemberInviteListApiResponse,
  TeamCreateByStudentRequest,
  TeamInviteRequest,
  TeamInviteRespondRequest,
  BooleanApiResponse
} from '../team-management.models';

@Injectable({
  providedIn: 'root'
})
export class TeamManagementService {
  private readonly endpoint = '/ProjectTeam';

  constructor(private readonly apiService: ApiService) {}

  getMyTeam(): Observable<ProjectTeamApiResponse> {
    return this.apiService.get<ProjectTeamApiResponse>(`${this.endpoint}/my-team`);
  }

  createTeam(request: TeamCreateByStudentRequest): Observable<ProjectTeamApiResponse> {
    return this.apiService.post<ProjectTeamApiResponse>(`${this.endpoint}/create`, request);
  }

  inviteMember(teamId: string, request: TeamInviteRequest): Observable<BooleanApiResponse> {
    return this.apiService.post<BooleanApiResponse>(`${this.endpoint}/${teamId}/invite`, request);
  }

  respondToInvite(request: TeamInviteRespondRequest): Observable<BooleanApiResponse> {
    return this.apiService.put<BooleanApiResponse>(`${this.endpoint}/respond`, request);
  }

  leaveTeam(teamId: string): Observable<BooleanApiResponse> {
    return this.apiService.post<BooleanApiResponse>(`${this.endpoint}/${teamId}/leave`, {});
  }

  dissolveTeam(teamId: string): Observable<BooleanApiResponse> {
    return this.apiService.delete<BooleanApiResponse>(`${this.endpoint}/${teamId}`);
  }

  getPendingInvites(): Observable<TeamMemberInviteListApiResponse> {
    return this.apiService.get<TeamMemberInviteListApiResponse>(`${this.endpoint}/pending-invites`);
  }
}
