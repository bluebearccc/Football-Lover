import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface LeaderboardRow {
  userId: string;
  displayName: string;
  winCount: number;
  totalPoints: number;
}

export const leaderboardRepository = {
  async getMonthlyWins(month: number, year: number, limit: number): Promise<LeaderboardRow[]> {
    const rows = await prisma.$queryRaw<LeaderboardRow[]>(Prisma.sql`
      SELECT
        mp.user_id     AS "userId",
        u.display_name AS "displayName",
        COUNT(*)::int  AS "winCount",
        u.total_points AS "totalPoints"
      FROM match_participations mp
      JOIN matches m ON m.id = mp.match_id
      JOIN users  u ON u.id = mp.user_id
      WHERE mp.is_winner = true
        AND m.status = 'FINISHED'
        AND EXTRACT(MONTH FROM m.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${month}
        AND EXTRACT(YEAR  FROM m.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${year}
        AND (
          SELECT COUNT(*) FROM match_participations sub
          WHERE sub.match_id = mp.match_id
        ) >= 2
      GROUP BY mp.user_id, u.display_name, u.total_points
      ORDER BY "winCount" DESC, u.total_points DESC
      LIMIT ${limit}
    `);
    return rows;
  },
};
