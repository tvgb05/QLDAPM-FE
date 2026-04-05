import { ApiResponse } from '../../shared/models/api-response.model';

export interface TrainingResultCreateRequest {
  projectTeamId?: string | null;
  finalScore?: number | null;
  grade?: string | null;
  isPassed?: boolean | null;
}

export interface TrainingResultResponse {
  id: string;
  projectTeamId: string;
  finalScore: number;
  grade: string | null;
  isPassed: boolean;
}

export type TrainingResultApiResponse = ApiResponse<TrainingResultResponse>;
