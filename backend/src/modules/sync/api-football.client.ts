import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

export interface ApiFootballTeam {
  id: number;
  name: string;
  code: string | null;
  logo: string | null;
}

export interface ApiFootballPlayer {
  id: number;
  name: string;
  position: string | null;
  photo: string | null;
}

interface TeamsResponse {
  response: Array<{ team: ApiFootballTeam }>;
}

interface SquadResponse {
  response: Array<{
    team: { id: number; name: string };
    players: ApiFootballPlayer[];
  }>;
}

async function apiFootballFetch<T>(path: string): Promise<T> {
  const key = env.integrations.apiFootballKey;
  if (!key) {
    throw ApiError.badRequest('API_FOOTBALL_KEY chưa được cấu hình trên máy chủ');
  }

  const url = `${env.integrations.apiFootballBaseUrl}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'x-apisports-key': key },
    });
  } catch {
    throw new ApiError(502, 'Không thể kết nối tới api-football');
  }

  if (!res.ok) {
    throw new ApiError(502, `api-football trả về lỗi ${res.status}`);
  }

  return (await res.json()) as T;
}

export const apiFootballClient = {
  async getTeamsByLeague(
    leagueId: number,
    season: number,
  ): Promise<ApiFootballTeam[]> {
    const data = await apiFootballFetch<TeamsResponse>(
      `/teams?league=${leagueId}&season=${season}`,
    );
    return data.response.map((item) => item.team);
  },

  async getSquad(teamExternalId: number): Promise<ApiFootballPlayer[]> {
    const data = await apiFootballFetch<SquadResponse>(
      `/players/squads?team=${teamExternalId}`,
    );
    if (data.response.length === 0) return [];
    return data.response[0].players;
  },
};
