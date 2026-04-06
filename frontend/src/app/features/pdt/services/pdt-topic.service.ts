import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { ApiService } from '../../../shared/services/api.service';
import {
  LecturerPagedApiResponse,
  LecturerResponse,
  ProjectTeamPagedApiResponse,
  ProjectTeamResponse,
  ProjectTopicCreateRequest,
  ProjectTopicPagedApiResponse,
  ProjectTopicResponse,
  ProjectTopicResponseApiResponse,
  TopicFormOption,
  TopicManagementContext,
  TopicTableItem,
} from '../pdt-topic.models';

@Injectable({
  providedIn: 'root',
})
export class PdtTopicService {
  constructor(private readonly apiService: ApiService) {}

  loadTopics(): Observable<TopicManagementContext> {
    return forkJoin({
      topicsResponse: this.apiService.get<ProjectTopicPagedApiResponse>(
        '/ProjectTopic/paging?PageIndex=1&PageSize=200'
      ),
      lecturersResponse: this.apiService.get<LecturerPagedApiResponse>(
        '/AppLecturer/paging?PageIndex=1&PageSize=200'
      ),
      teamsResponse: this.apiService.get<ProjectTeamPagedApiResponse>(
        '/ProjectTeam/paging?PageIndex=1&PageSize=200'
      ),
    }).pipe(
      map(({ topicsResponse, lecturersResponse, teamsResponse }) => {
        const topics = topicsResponse.data?.results ?? [];
        const lecturers = lecturersResponse.data?.results ?? [];
        const teams = teamsResponse.data?.results ?? [];

        return {
          topics: this.mapTopicTableItems(topics, lecturers, teams),
          teams: this.mapTeamOptions(teams),
          lecturers: this.mapLecturerOptions(lecturers),
        };
      })
    );
  }

  createTopic(payload: ProjectTopicCreateRequest): Observable<ProjectTopicResponseApiResponse> {
    return this.apiService.post<ProjectTopicResponseApiResponse>('/ProjectTopic', payload);
  }

  private mapTopicTableItems(
    topics: ProjectTopicResponse[],
    lecturers: LecturerResponse[],
    teams: ProjectTeamResponse[]
  ): TopicTableItem[] {
    const lecturerMap = new Map(lecturers.map((lecturer) => [lecturer.id, lecturer]));
    const teamMap = new Map(teams.map((team) => [team.id, team]));

    return topics.map((topic) => {
      const lecturer = lecturerMap.get(topic.teacherId);
      const team = teamMap.get(topic.projectTeamId);

      return {
        id: topic.id,
        teamId: topic.projectTeamId,
        teamName: team?.teamName?.trim() || 'Chưa có tên nhóm',
        title: topic.title?.trim() || 'Chưa có tên đề tài',
        lecturerName: lecturer?.fullName?.trim() || 'Chưa có giảng viên',
        description: topic.description?.trim() || 'Chưa có mô tả',
      };
    });
  }

  private mapTeamOptions(teams: ProjectTeamResponse[]): TopicFormOption[] {
    return teams.map((team) => ({
      id: team.id,
      label: team.teamName?.trim() || team.id,
    }));
  }

  private mapLecturerOptions(lecturers: LecturerResponse[]): TopicFormOption[] {
    return lecturers.map((lecturer) => ({
      id: lecturer.id,
      label: lecturer.fullName?.trim() || lecturer.teacherCode?.trim() || lecturer.id,
    }));
  }
}
