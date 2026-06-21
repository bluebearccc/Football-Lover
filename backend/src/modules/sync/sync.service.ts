import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';

export interface SyncResult {
  triggeredAt: string;
  provider: 'api-football';
  matchesSynced: number;
  teamsSynced: number;
  playersSynced: number;
  note: string;
}

/**
 * FR-13 external data sync. The live api-football integration (REST JSON pull every
 * 15–30 min, external_id mapping, Admin-data priority on conflict) is deferred; this
 * service exposes a manual trigger and guards that the API key is configured
 * server-side. It performs no network call yet (no fabricated data — per CLAUDE.md).
 */
export const syncService = {
  refreshMatches(): SyncResult {
    if (!env.integrations.apiFootballKey) {
      throw ApiError.badRequest('API_FOOTBALL_KEY chưa được cấu hình trên máy chủ');
    }
    return {
      triggeredAt: new Date().toISOString(),
      provider: 'api-football',
      matchesSynced: 0,
      teamsSynced: 0,
      playersSynced: 0,
      note: 'Đồng bộ thủ công đã sẵn sàng; tích hợp gọi API thực sẽ được bật ở bước sau (FR-13).',
    };
  },
};
