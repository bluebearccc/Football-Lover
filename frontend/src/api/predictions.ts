import { apiFetch } from './client';
import { session } from '@/lib/session';

export interface PredictionResponse {
  id: string;
  userId: string;
  matchId: string;
  criterionId: string;
  selectedTeam: 'HOME' | 'AWAY';
  isCorrect: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyPredictionResponse {
  id: string;
  userId: string;
  matchId: string;
  criterionId: string;
  selectedTeam: 'HOME' | 'AWAY';
  isCorrect: boolean | null;
  createdAt: string;
  updatedAt: string;
  criterion: {
    id: string;
    name: string;
    description: string | null;
    resultTeam: 'HOME' | 'AWAY' | null;
  };
}

export const predictionsApi = {
  submit(
    matchId: string,
    criterionId: string,
    selectedTeam: 'HOME' | 'AWAY',
  ): Promise<PredictionResponse> {
    const token = session.getToken();
    return apiFetch<PredictionResponse>('/predictions', {
      method: 'POST',
      body: { matchId, criterionId, selectedTeam },
      token: token ?? undefined,
    });
  },

  getMyPredictions(matchId: string): Promise<MyPredictionResponse[]> {
    const token = session.getToken();
    return apiFetch<MyPredictionResponse[]>(`/predictions/match/${matchId}/my`, {
      token: token ?? undefined,
    });
  },
};
