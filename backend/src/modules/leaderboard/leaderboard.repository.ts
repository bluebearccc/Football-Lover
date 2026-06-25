import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface LeaderboardRow {
  userId: string;
  displayName: string;
  winCount: number;
  totalPoints: number;
  accuracy: number | null;
  winStreak: number;
}

export const leaderboardRepository = {
  async getMonthlyWins(
    month: number,
    year: number,
    pageSize: number,
    offset: number,
  ): Promise<LeaderboardRow[]> {
    const rows = await prisma.$queryRaw<LeaderboardRow[]>(Prisma.sql`
      WITH monthly_wins AS (
        SELECT
          mp.user_id AS "userId",
          u.display_name AS "displayName",
          COUNT(*)::int AS "winCount",
          u.total_points AS "totalPoints"
        FROM match_participations mp
        JOIN matches m ON m.id = mp.match_id
        JOIN users  u ON u.id = mp.user_id
        WHERE mp.is_winner = true
          AND m.status = 'FINISHED'
          AND EXTRACT(MONTH FROM m.match_time AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${month}
          AND EXTRACT(YEAR  FROM m.match_time AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${year}
          AND (
            SELECT COUNT(*) FROM match_participations sub
            WHERE sub.match_id = mp.match_id
          ) >= 2
        GROUP BY mp.user_id, u.display_name, u.total_points
      ),
      user_accuracy AS (
        SELECT
          p.user_id AS "userId",
          CASE
            WHEN COUNT(CASE WHEN p.is_correct IS NOT NULL THEN 1 END) = 0 THEN NULL
            ELSE ROUND(
              COUNT(CASE WHEN p.is_correct = true THEN 1 END)::numeric
              / NULLIF(COUNT(CASE WHEN p.is_correct IS NOT NULL THEN 1 END), 0),
              4
            )
          END AS accuracy
        FROM predictions p
        GROUP BY p.user_id
      ),
      user_streak AS (
        SELECT
          mp2."userId",
          COALESCE(
            (
              SELECT COUNT(*)::int
              FROM (
                SELECT mp3.is_winner,
                       ROW_NUMBER() OVER (ORDER BY m2.match_time DESC)
                         - ROW_NUMBER() OVER (PARTITION BY mp3.is_winner ORDER BY m2.match_time DESC) AS grp
                FROM match_participations mp3
                JOIN matches m2 ON m2.id = mp3.match_id
                WHERE mp3.user_id = mp2."userId"
                  AND m2.status = 'FINISHED'
              ) streaks
              WHERE streaks.is_winner = true AND streaks.grp = (
                SELECT s2.grp
                FROM (
                  SELECT mp4.is_winner,
                         ROW_NUMBER() OVER (ORDER BY m3.match_time DESC)
                           - ROW_NUMBER() OVER (PARTITION BY mp4.is_winner ORDER BY m3.match_time DESC) AS grp
                  FROM match_participations mp4
                  JOIN matches m3 ON m3.id = mp4.match_id
                  WHERE mp4.user_id = mp2."userId"
                    AND m3.status = 'FINISHED'
                ) s2
                WHERE s2.is_winner = true
                ORDER BY s2.grp ASC
                LIMIT 1
              )
            ),
            0
          ) AS "winStreak"
        FROM monthly_wins mp2
      )
      SELECT
        mw."userId",
        mw."displayName",
        mw."winCount",
        mw."totalPoints",
        ua.accuracy::float AS accuracy,
        COALESCE(us."winStreak", 0)::int AS "winStreak"
      FROM monthly_wins mw
      LEFT JOIN user_accuracy ua ON ua."userId" = mw."userId"
      LEFT JOIN user_streak us ON us."userId" = mw."userId"
      ORDER BY mw."winCount" DESC, ua.accuracy DESC NULLS LAST
      LIMIT ${pageSize} OFFSET ${offset}
    `);
    return rows;
  },

  async countMonthlyRankedUsers(month: number, year: number): Promise<number> {
    const result = await prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
      SELECT COUNT(DISTINCT mp.user_id)::bigint AS count
      FROM match_participations mp
      JOIN matches m ON m.id = mp.match_id
      WHERE mp.is_winner = true
        AND m.status = 'FINISHED'
        AND EXTRACT(MONTH FROM m.match_time AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${month}
        AND EXTRACT(YEAR  FROM m.match_time AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${year}
        AND (
          SELECT COUNT(*) FROM match_participations sub
          WHERE sub.match_id = mp.match_id
        ) >= 2
    `);
    return Number(result[0].count);
  },

  async findUserRank(
    userId: string,
    month: number,
    year: number,
  ): Promise<LeaderboardRow & { rank: number } | null> {
    const rows = await prisma.$queryRaw<(LeaderboardRow & { rank: number })[]>(Prisma.sql`
      WITH monthly_wins AS (
        SELECT
          mp.user_id AS "userId",
          u.display_name AS "displayName",
          COUNT(*)::int AS "winCount",
          u.total_points AS "totalPoints"
        FROM match_participations mp
        JOIN matches m ON m.id = mp.match_id
        JOIN users  u ON u.id = mp.user_id
        WHERE mp.is_winner = true
          AND m.status = 'FINISHED'
          AND EXTRACT(MONTH FROM m.match_time AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${month}
          AND EXTRACT(YEAR  FROM m.match_time AT TIME ZONE 'Asia/Ho_Chi_Minh') = ${year}
          AND (
            SELECT COUNT(*) FROM match_participations sub
            WHERE sub.match_id = mp.match_id
          ) >= 2
        GROUP BY mp.user_id, u.display_name, u.total_points
      ),
      user_accuracy AS (
        SELECT
          p.user_id AS "userId",
          CASE
            WHEN COUNT(CASE WHEN p.is_correct IS NOT NULL THEN 1 END) = 0 THEN NULL
            ELSE ROUND(
              COUNT(CASE WHEN p.is_correct = true THEN 1 END)::numeric
              / NULLIF(COUNT(CASE WHEN p.is_correct IS NOT NULL THEN 1 END), 0),
              4
            )
          END AS accuracy
        FROM predictions p
        GROUP BY p.user_id
      ),
      user_streak AS (
        SELECT
          mp2."userId",
          COALESCE(
            (
              SELECT COUNT(*)::int
              FROM (
                SELECT mp3.is_winner,
                       ROW_NUMBER() OVER (ORDER BY m2.match_time DESC)
                         - ROW_NUMBER() OVER (PARTITION BY mp3.is_winner ORDER BY m2.match_time DESC) AS grp
                FROM match_participations mp3
                JOIN matches m2 ON m2.id = mp3.match_id
                WHERE mp3.user_id = mp2."userId"
                  AND m2.status = 'FINISHED'
              ) streaks
              WHERE streaks.is_winner = true AND streaks.grp = (
                SELECT s2.grp
                FROM (
                  SELECT mp4.is_winner,
                         ROW_NUMBER() OVER (ORDER BY m3.match_time DESC)
                           - ROW_NUMBER() OVER (PARTITION BY mp4.is_winner ORDER BY m3.match_time DESC) AS grp
                  FROM match_participations mp4
                  JOIN matches m3 ON m3.id = mp4.match_id
                  WHERE mp4.user_id = mp2."userId"
                    AND m3.status = 'FINISHED'
                ) s2
                WHERE s2.is_winner = true
                ORDER BY s2.grp ASC
                LIMIT 1
              )
            ),
            0
          ) AS "winStreak"
        FROM monthly_wins mp2
      ),
      ranked AS (
        SELECT
          mw."userId",
          mw."displayName",
          mw."winCount",
          mw."totalPoints",
          ua.accuracy::float AS accuracy,
          COALESCE(us."winStreak", 0)::int AS "winStreak",
          DENSE_RANK() OVER (ORDER BY mw."winCount" DESC, ua.accuracy DESC NULLS LAST) AS rank
        FROM monthly_wins mw
        LEFT JOIN user_accuracy ua ON ua."userId" = mw."userId"
        LEFT JOIN user_streak us ON us."userId" = mw."userId"
      )
      SELECT
        r."userId",
        r."displayName",
        r."winCount",
        r."totalPoints",
        r.accuracy,
        r."winStreak",
        r.rank::int
      FROM ranked r
      WHERE r."userId" = ${userId}::uuid
      LIMIT 1
    `);
    return rows[0] ?? null;
  },
};
