import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { ApiService } from '../../../shared/services/api.service';
import {
  FacultyListApiResponse,
  FacultyResponse,
  LecturerPagedApiResponse,
  LecturerResponse,
  ProjectTopicListApiResponse,
  ProjectTopicResponse,
  TopicTableItem,
} from '../pdt-topic.models';

interface TopicContext {
  topics: TopicTableItem[];
}

@Injectable({
  providedIn: 'root',
})
export class PdtTopicService {
  constructor(private readonly apiService: ApiService) {}

  loadTopics(): Observable<TopicContext> {
    return forkJoin({
      topicsResponse: this.apiService.get<ProjectTopicListApiResponse>('/ProjectTopic/public-data'),
      lecturersResponse: this.apiService.get<LecturerPagedApiResponse>(
        '/AppLecturer/paging?PageIndex=1&PageSize=100'
      ),
      facultiesResponse: this.apiService.get<FacultyListApiResponse>('/AppFaculty/public-data'),
    }).pipe(
      map(({ topicsResponse, lecturersResponse, facultiesResponse }) => {
        const topics = topicsResponse.data ?? [];
        const lecturers = lecturersResponse.data?.results ?? [];
        const faculties = facultiesResponse.data ?? [];

        return {
          topics: this.mapTopicTableItems(topics, lecturers, faculties),
        };
      })
    );
  }

  private mapTopicTableItems(
    topics: ProjectTopicResponse[],
    lecturers: LecturerResponse[],
    faculties: FacultyResponse[]
  ): TopicTableItem[] {
    const lecturerMap = new Map(lecturers.map((lecturer) => [lecturer.id, lecturer]));
    const facultyMap = new Map(faculties.map((faculty) => [faculty.id, faculty]));

    return topics.map((topic, index) => {
      const lecturer = lecturerMap.get(topic.teacherId);
      const faculty = lecturer?.facultyId != null ? facultyMap.get(lecturer.facultyId) : undefined;

      return {
        id: topic.id,
        title: topic.title?.trim() || 'Chưa có tên đề tài',
        code: this.buildTopicCode(index),
        faculty: faculty?.facultyName?.trim() || 'Chưa có khoa',
        facultyClass: this.buildFacultyClass(index),
        lecturers: [lecturer?.fullName?.trim() || 'Chưa có giảng viên'],
      };
    });
  }

  private buildTopicCode(index: number): string {
    return `DT-${String(index + 1).padStart(3, '0')}`;
  }

  private buildFacultyClass(index: number): string {
    const classes = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-orange-100 text-orange-700',
      'bg-purple-100 text-purple-700',
    ];

    return classes[index % classes.length];
  }
}
