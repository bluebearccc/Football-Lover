import type { DateRange } from './dashboard.repository';
import { dashboardRepository } from './dashboard.repository';
import { adminLogService } from '../admin-log/admin-log.service';

export interface DashboardStats {
  users: number;
  lockedUsers: number;
  teams: number;
  activeTeams: number;
  matches: number;
  liveOrScheduled: number;
  finishedMatches: number;
  predictions: number;
  comments: number;
  hiddenComments: number;
  totalGoldPool: string;
}

export const dashboardService = {
  async stats(range?: DateRange): Promise<DashboardStats> {
    const [
      users,
      lockedUsers,
      teams,
      activeTeams,
      matches,
      liveOrScheduled,
      finishedMatches,
      predictions,
      comments,
      hiddenComments,
      totalGoldPool,
    ] = await Promise.all([
      dashboardRepository.countUsers(range),
      dashboardRepository.countLockedUsers(range),
      dashboardRepository.countTeams(),
      dashboardRepository.countActiveTeams(),
      dashboardRepository.countMatches(range),
      dashboardRepository.countLiveOrScheduled(),
      dashboardRepository.countFinishedMatches(range),
      dashboardRepository.countPredictions(range),
      dashboardRepository.countComments(range),
      dashboardRepository.countHiddenComments(range),
      dashboardRepository.sumGoldPool(range),
    ]);
    return {
      users,
      lockedUsers,
      teams,
      activeTeams,
      matches,
      liveOrScheduled,
      finishedMatches,
      predictions,
      comments,
      hiddenComments,
      totalGoldPool,
    };
  },

  async getTraffic(period: '24h' | '7d') {
    if (period === '7d') {
      return dashboardRepository.getTrafficByDay();
    }
    return dashboardRepository.getTrafficByHour();
  },

  async getRecentLogs() {
    return adminLogService.getLogs({ pageSize: 5 });
  },

  recentMatches() {
    return dashboardRepository.recentMatches();
  },

  async getExportData(range?: DateRange, period: '24h' | '7d' = '24h'): Promise<string> {
    const [stats, traffic] = await Promise.all([
      this.stats(range),
      this.getTraffic(period),
    ]);
    const periodLabel = period === '7d' ? 'Last 7d' : 'Last 24h';
    const rows: string[][] = [
      ['Metric', 'Value', 'Period'],
      ['Total Active Users', String(stats.users), 'All Time'],
      ['Locked Users', String(stats.lockedUsers), 'All Time'],
      ['Total Teams', String(stats.teams), 'All Time'],
      ['Active Teams', String(stats.activeTeams), 'All Time'],
      ['Total Matches', String(stats.matches), 'All Time'],
      ['Live/Scheduled Matches', String(stats.liveOrScheduled), 'Current'],
      ['Finished Matches', String(stats.finishedMatches), 'All Time'],
      ['Total Predictions', String(stats.predictions), 'All Time'],
      ['Total Comments', String(stats.comments), 'All Time'],
      ['Hidden Comments', String(stats.hiddenComments), 'All Time'],
      ['Total Gold Pool (GP)', stats.totalGoldPool, 'All Time'],
    ];
    for (const bucket of traffic) {
      rows.push([`Traffic: ${bucket.bucket}`, String(bucket.count), periodLabel]);
    }
    return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  },
};
