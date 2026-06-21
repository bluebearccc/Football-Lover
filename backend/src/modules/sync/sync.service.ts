import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { teamsRepository } from '../teams/teams.repository';
import { apiFootballClient } from './api-football.client';

export interface SyncCounts {
  created: number;
  updated: number;
  unchanged: number;
}

export interface SyncResult {
  triggeredAt: string;
  provider: 'api-football';
  leagueId: number;
  season: number;
  teams: SyncCounts;
  players: SyncCounts;
  note: string;
}

export const syncService = {
  async syncTeamsByLeague(leagueId: number, season?: number): Promise<SyncResult> {
    if (!env.integrations.apiFootballKey) {
      throw ApiError.badRequest('API_FOOTBALL_KEY chưa được cấu hình trên máy chủ');
    }

    const resolvedSeason = season ?? new Date().getFullYear();

    const externalTeams = await apiFootballClient.getTeamsByLeague(
      leagueId,
      resolvedSeason,
    );

    const teamCounts: SyncCounts = { created: 0, updated: 0, unchanged: 0 };
    const playerCounts: SyncCounts = { created: 0, updated: 0, unchanged: 0 };

    for (const extTeam of externalTeams) {
      const { team, created } = await teamsRepository.upsertByExternalId({
        externalId: String(extTeam.id),
        name: extTeam.name,
        shortName: extTeam.code,
        logoUrl: extTeam.logo,
      });

      if (created) {
        teamCounts.created++;
      } else {
        teamCounts.updated++;
      }

      const players = await apiFootballClient.getSquad(extTeam.id);

      for (const extPlayer of players) {
        const playerResult = await teamsRepository.upsertPlayerByExternalId({
          externalId: String(extPlayer.id),
          teamId: team.id,
          name: extPlayer.name,
          position: extPlayer.position,
          imageUrl: extPlayer.photo,
        });

        if (playerResult.created) {
          playerCounts.created++;
        } else {
          playerCounts.updated++;
        }
      }
    }

    return {
      triggeredAt: new Date().toISOString(),
      provider: 'api-football',
      leagueId,
      season: resolvedSeason,
      teams: teamCounts,
      players: playerCounts,
      note: 'Đồng bộ hoàn tất',
    };
  },
};
