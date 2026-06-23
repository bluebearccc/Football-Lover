import {
  PrismaClient,
  Role,
  UserStatus,
  MatchStatus,
  TeamSide,
  CriterionSource,
  CommentStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[seed] Starting full database seed...');

  // ───────────────────────────────────────────────
  // 0. Cleanup — delete in reverse FK order so the
  //    seed is idempotent (safe to run multiple times)
  // ───────────────────────────────────────────────
  await prisma.passwordResetToken.deleteMany({});
  await prisma.chatbotConversation.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.matchParticipation.deleteMany({});
  await prisma.prediction.deleteMany({});
  await prisma.statistic.deleteMany({});
  await prisma.predictionCriterion.deleteMany({});
  await prisma.match.deleteMany({});
  // eslint-disable-next-line no-console
  console.log('[seed] Cleaned transactional tables');

  // ───────────────────────────────────────────────
  // 1. Users (1 admin + 5 regular users)
  // ───────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123', 10);
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'Admin12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@football-lover.local' },
    update: {},
    create: {
      email: 'admin@football-lover.local',
      displayName: 'Administrator',
      passwordHash: adminHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      totalPoints: 0,
    },
  });

  const usersData = [
    { email: 'nguyenvana@example.com', displayName: 'Nguyễn Văn A' },
    { email: 'tranthib@example.com', displayName: 'Trần Thị B' },
    { email: 'levanc@example.com', displayName: 'Lê Văn C' },
    { email: 'phamthid@example.com', displayName: 'Phạm Thị D' },
    { email: 'hoangvane@example.com', displayName: 'Hoàng Văn E' },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          ...u,
          passwordHash,
          role: Role.USER,
          status: UserStatus.ACTIVE,
          totalPoints: 0,
        },
      }),
    ),
  );

  // eslint-disable-next-line no-console
  console.log(`[seed] Users: admin + ${users.length} users`);

  // ───────────────────────────────────────────────
  // 2. Teams (6 teams)
  // ───────────────────────────────────────────────
  const teamsData = [
    { name: 'Manchester United', shortName: 'MUN', externalId: 'ext-33' },
    { name: 'Liverpool', shortName: 'LIV', externalId: 'ext-40' },
    { name: 'Arsenal', shortName: 'ARS', externalId: 'ext-42' },
    { name: 'Chelsea', shortName: 'CHE', externalId: 'ext-49' },
    { name: 'Manchester City', shortName: 'MCI', externalId: 'ext-50' },
    { name: 'Tottenham Hotspur', shortName: 'TOT', externalId: 'ext-47' },
  ];

  const teams = await Promise.all(
    teamsData.map((t) =>
      prisma.team.upsert({
        where: { externalId: t.externalId },
        update: {},
        create: { ...t, isActive: true },
      }),
    ),
  );

  // eslint-disable-next-line no-console
  console.log(`[seed] Teams: ${teams.length}`);

  // ───────────────────────────────────────────────
  // 3. Players (3 per team = 18)
  // ───────────────────────────────────────────────
  const playersData: { teamIdx: number; name: string; position: string; externalId: string }[] = [
    { teamIdx: 0, name: 'Marcus Rashford', position: 'Forward', externalId: 'pl-1' },
    { teamIdx: 0, name: 'Bruno Fernandes', position: 'Midfielder', externalId: 'pl-2' },
    { teamIdx: 0, name: 'André Onana', position: 'Goalkeeper', externalId: 'pl-3' },
    { teamIdx: 1, name: 'Mohamed Salah', position: 'Forward', externalId: 'pl-4' },
    { teamIdx: 1, name: 'Virgil van Dijk', position: 'Defender', externalId: 'pl-5' },
    { teamIdx: 1, name: 'Alisson Becker', position: 'Goalkeeper', externalId: 'pl-6' },
    { teamIdx: 2, name: 'Bukayo Saka', position: 'Forward', externalId: 'pl-7' },
    { teamIdx: 2, name: 'Martin Ødegaard', position: 'Midfielder', externalId: 'pl-8' },
    { teamIdx: 2, name: 'William Saliba', position: 'Defender', externalId: 'pl-9' },
    { teamIdx: 3, name: 'Cole Palmer', position: 'Midfielder', externalId: 'pl-10' },
    { teamIdx: 3, name: 'Nicolas Jackson', position: 'Forward', externalId: 'pl-11' },
    { teamIdx: 3, name: 'Robert Sánchez', position: 'Goalkeeper', externalId: 'pl-12' },
    { teamIdx: 4, name: 'Erling Haaland', position: 'Forward', externalId: 'pl-13' },
    { teamIdx: 4, name: 'Kevin De Bruyne', position: 'Midfielder', externalId: 'pl-14' },
    { teamIdx: 4, name: 'Ederson Moraes', position: 'Goalkeeper', externalId: 'pl-15' },
    { teamIdx: 5, name: 'Son Heung-min', position: 'Forward', externalId: 'pl-16' },
    { teamIdx: 5, name: 'James Maddison', position: 'Midfielder', externalId: 'pl-17' },
    { teamIdx: 5, name: 'Guglielmo Vicario', position: 'Goalkeeper', externalId: 'pl-18' },
  ];

  const players = await Promise.all(
    playersData.map((p) =>
      prisma.player.upsert({
        where: { externalId: p.externalId },
        update: {},
        create: {
          teamId: teams[p.teamIdx].id,
          name: p.name,
          position: p.position,
          externalId: p.externalId,
        },
      }),
    ),
  );

  // eslint-disable-next-line no-console
  console.log(`[seed] Players: ${players.length}`);

  // ───────────────────────────────────────────────
  // 4. Matches (5 matches in various statuses)
  // ───────────────────────────────────────────────
  const now = new Date();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  // Match 1: FINISHED — MUN vs LIV (scored, with gold payout)
  const match1 = await prisma.match.create({
    data: {
      homeTeamId: teams[0].id,
      awayTeamId: teams[1].id,
      matchTime: new Date(now.getTime() - 3 * day),
      startDate: new Date(now.getTime() - 3 * day),
      endDate: new Date(now.getTime() - 3 * day + 2 * hour),
      status: MatchStatus.FINISHED,
      homeScore: 2,
      awayScore: 1,
      entryGold: new Prisma.Decimal(100),
    },
  });

  // Match 2: FINISHED — ARS vs CHE (scored, all wrong → pool void)
  const match2 = await prisma.match.create({
    data: {
      homeTeamId: teams[2].id,
      awayTeamId: teams[3].id,
      matchTime: new Date(now.getTime() - 2 * day),
      startDate: new Date(now.getTime() - 2 * day),
      endDate: new Date(now.getTime() - 2 * day + 2 * hour),
      status: MatchStatus.FINISHED,
      homeScore: 0,
      awayScore: 0,
      entryGold: new Prisma.Decimal(100),
    },
  });

  // Match 3: LIVE — MCI vs TOT
  const match3 = await prisma.match.create({
    data: {
      homeTeamId: teams[4].id,
      awayTeamId: teams[5].id,
      matchTime: new Date(now.getTime() - 1 * hour),
      startDate: new Date(now.getTime() - 1 * hour),
      status: MatchStatus.LIVE,
      entryGold: new Prisma.Decimal(200),
    },
  });

  // Match 4: SCHEDULED — LIV vs ARS (future)
  const match4 = await prisma.match.create({
    data: {
      homeTeamId: teams[1].id,
      awayTeamId: teams[2].id,
      matchTime: new Date(now.getTime() + 2 * day),
      status: MatchStatus.SCHEDULED,
      entryGold: new Prisma.Decimal(100),
    },
  });

  // Match 5: CANCELLED — CHE vs MUN
  const match5 = await prisma.match.create({
    data: {
      homeTeamId: teams[3].id,
      awayTeamId: teams[0].id,
      matchTime: new Date(now.getTime() - 5 * day),
      status: MatchStatus.CANCELLED,
      entryGold: new Prisma.Decimal(100),
    },
  });

  // eslint-disable-next-line no-console
  console.log('[seed] Matches: 5 (FINISHED×2, LIVE×1, SCHEDULED×1, CANCELLED×1)');

  // ───────────────────────────────────────────────
  // 5. PredictionCriteria (3 per match 1/2/3, 2 for match 4)
  // ───────────────────────────────────────────────
  const criteriaM1 = await Promise.all([
    prisma.predictionCriterion.create({
      data: {
        matchId: match1.id,
        name: 'Đội ghi bàn trước',
        description: 'Đội nào sẽ ghi bàn thắng đầu tiên?',
        resultTeam: TeamSide.HOME,
        resolvedAt: new Date(now.getTime() - 3 * day + 2 * hour),
        source: CriterionSource.MANUAL,
      },
    }),
    prisma.predictionCriterion.create({
      data: {
        matchId: match1.id,
        name: 'Đội thắng trận',
        description: 'Đội nào sẽ giành chiến thắng?',
        resultTeam: TeamSide.HOME,
        resolvedAt: new Date(now.getTime() - 3 * day + 2 * hour),
        source: CriterionSource.MANUAL,
      },
    }),
    prisma.predictionCriterion.create({
      data: {
        matchId: match1.id,
        name: 'Tổng bàn thắng trên 2.5',
        description: 'Tổng số bàn thắng có lớn hơn 2.5 không?',
        resultTeam: TeamSide.HOME,
        resolvedAt: new Date(now.getTime() - 3 * day + 2 * hour),
        source: CriterionSource.MANUAL,
      },
    }),
  ]);

  const criteriaM2 = await Promise.all([
    prisma.predictionCriterion.create({
      data: {
        matchId: match2.id,
        name: 'Đội ghi bàn trước',
        resultTeam: TeamSide.AWAY,
        resolvedAt: new Date(now.getTime() - 2 * day + 2 * hour),
        source: CriterionSource.MANUAL,
      },
    }),
    prisma.predictionCriterion.create({
      data: {
        matchId: match2.id,
        name: 'Đội thắng trận',
        resultTeam: TeamSide.AWAY,
        resolvedAt: new Date(now.getTime() - 2 * day + 2 * hour),
        source: CriterionSource.MANUAL,
      },
    }),
    prisma.predictionCriterion.create({
      data: {
        matchId: match2.id,
        name: 'Đội giữ sạch lưới',
        resultTeam: TeamSide.AWAY,
        resolvedAt: new Date(now.getTime() - 2 * day + 2 * hour),
        source: CriterionSource.MANUAL,
      },
    }),
  ]);

  const criteriaM3 = await Promise.all([
    prisma.predictionCriterion.create({
      data: { matchId: match3.id, name: 'Đội ghi bàn trước', source: CriterionSource.MANUAL },
    }),
    prisma.predictionCriterion.create({
      data: { matchId: match3.id, name: 'Đội thắng trận', source: CriterionSource.MANUAL },
    }),
    prisma.predictionCriterion.create({
      data: { matchId: match3.id, name: 'Có phạt đền không', source: CriterionSource.MANUAL },
    }),
  ]);

  const criteriaM4 = await Promise.all([
    prisma.predictionCriterion.create({
      data: { matchId: match4.id, name: 'Đội ghi bàn trước', source: CriterionSource.MANUAL },
    }),
    prisma.predictionCriterion.create({
      data: { matchId: match4.id, name: 'Đội thắng trận', source: CriterionSource.MANUAL },
    }),
  ]);

  // eslint-disable-next-line no-console
  console.log('[seed] Criteria: 11 total');

  // ───────────────────────────────────────────────
  // 6. Predictions
  //    Match 1: 4 users predict (user A, B, C, D)
  //    Match 2: 3 users predict (user A, B, C) — all wrong
  //    Match 3: 3 users predict (user A, B, E) — LIVE
  //    Match 4: 2 users predict (user A, D) — SCHEDULED
  // ───────────────────────────────────────────────
  // Match 1 predictions (HOME won all criteria)
  const predictionsM1 = await Promise.all([
    // User A: 3/3 correct → winner
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match1.id, criterionId: criteriaM1[0].id, selectedTeam: TeamSide.HOME, isCorrect: true } }),
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match1.id, criterionId: criteriaM1[1].id, selectedTeam: TeamSide.HOME, isCorrect: true } }),
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match1.id, criterionId: criteriaM1[2].id, selectedTeam: TeamSide.HOME, isCorrect: true } }),
    // User B: 2/3 correct
    prisma.prediction.create({ data: { userId: users[1].id, matchId: match1.id, criterionId: criteriaM1[0].id, selectedTeam: TeamSide.HOME, isCorrect: true } }),
    prisma.prediction.create({ data: { userId: users[1].id, matchId: match1.id, criterionId: criteriaM1[1].id, selectedTeam: TeamSide.AWAY, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[1].id, matchId: match1.id, criterionId: criteriaM1[2].id, selectedTeam: TeamSide.HOME, isCorrect: true } }),
    // User C: 1/3 correct
    prisma.prediction.create({ data: { userId: users[2].id, matchId: match1.id, criterionId: criteriaM1[0].id, selectedTeam: TeamSide.AWAY, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[2].id, matchId: match1.id, criterionId: criteriaM1[1].id, selectedTeam: TeamSide.AWAY, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[2].id, matchId: match1.id, criterionId: criteriaM1[2].id, selectedTeam: TeamSide.HOME, isCorrect: true } }),
    // User D: 0/3 correct
    prisma.prediction.create({ data: { userId: users[3].id, matchId: match1.id, criterionId: criteriaM1[0].id, selectedTeam: TeamSide.AWAY, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[3].id, matchId: match1.id, criterionId: criteriaM1[1].id, selectedTeam: TeamSide.AWAY, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[3].id, matchId: match1.id, criterionId: criteriaM1[2].id, selectedTeam: TeamSide.AWAY, isCorrect: false } }),
  ]);

  // Match 2 predictions (AWAY won all → everyone picked HOME → all 0 score → pool void)
  await Promise.all([
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match2.id, criterionId: criteriaM2[0].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match2.id, criterionId: criteriaM2[1].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match2.id, criterionId: criteriaM2[2].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[1].id, matchId: match2.id, criterionId: criteriaM2[0].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[1].id, matchId: match2.id, criterionId: criteriaM2[1].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[1].id, matchId: match2.id, criterionId: criteriaM2[2].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[2].id, matchId: match2.id, criterionId: criteriaM2[0].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[2].id, matchId: match2.id, criterionId: criteriaM2[1].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
    prisma.prediction.create({ data: { userId: users[2].id, matchId: match2.id, criterionId: criteriaM2[2].id, selectedTeam: TeamSide.HOME, isCorrect: false } }),
  ]);

  // Match 3 predictions (LIVE — not scored yet)
  await Promise.all([
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match3.id, criterionId: criteriaM3[0].id, selectedTeam: TeamSide.HOME } }),
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match3.id, criterionId: criteriaM3[1].id, selectedTeam: TeamSide.HOME } }),
    prisma.prediction.create({ data: { userId: users[1].id, matchId: match3.id, criterionId: criteriaM3[0].id, selectedTeam: TeamSide.AWAY } }),
    prisma.prediction.create({ data: { userId: users[1].id, matchId: match3.id, criterionId: criteriaM3[1].id, selectedTeam: TeamSide.HOME } }),
    prisma.prediction.create({ data: { userId: users[4].id, matchId: match3.id, criterionId: criteriaM3[0].id, selectedTeam: TeamSide.HOME } }),
    prisma.prediction.create({ data: { userId: users[4].id, matchId: match3.id, criterionId: criteriaM3[2].id, selectedTeam: TeamSide.AWAY } }),
  ]);

  // Match 4 predictions (SCHEDULED — not scored yet)
  await Promise.all([
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match4.id, criterionId: criteriaM4[0].id, selectedTeam: TeamSide.HOME } }),
    prisma.prediction.create({ data: { userId: users[0].id, matchId: match4.id, criterionId: criteriaM4[1].id, selectedTeam: TeamSide.AWAY } }),
    prisma.prediction.create({ data: { userId: users[3].id, matchId: match4.id, criterionId: criteriaM4[0].id, selectedTeam: TeamSide.AWAY } }),
    prisma.prediction.create({ data: { userId: users[3].id, matchId: match4.id, criterionId: criteriaM4[1].id, selectedTeam: TeamSide.AWAY } }),
  ]);

  // eslint-disable-next-line no-console
  console.log(`[seed] Predictions: ${predictionsM1.length + 9 + 6 + 4}`);

  // ───────────────────────────────────────────────
  // 7. MatchParticipation (scored matches only: M1, M2)
  // ───────────────────────────────────────────────
  // Match 1: User A wins (score 3), pool = 400, gold = 400.00
  await Promise.all([
    prisma.matchParticipation.create({ data: { matchId: match1.id, userId: users[0].id, score: 3, isWinner: true, goldWon: new Prisma.Decimal('400.00') } }),
    prisma.matchParticipation.create({ data: { matchId: match1.id, userId: users[1].id, score: 2, isWinner: false, goldWon: new Prisma.Decimal('0.00') } }),
    prisma.matchParticipation.create({ data: { matchId: match1.id, userId: users[2].id, score: 1, isWinner: false, goldWon: new Prisma.Decimal('0.00') } }),
    prisma.matchParticipation.create({ data: { matchId: match1.id, userId: users[3].id, score: 0, isWinner: false, goldWon: new Prisma.Decimal('0.00') } }),
  ]);

  // Match 2: All 0 → pool void, no winner
  await Promise.all([
    prisma.matchParticipation.create({ data: { matchId: match2.id, userId: users[0].id, score: 0, isWinner: false, goldWon: new Prisma.Decimal('0.00') } }),
    prisma.matchParticipation.create({ data: { matchId: match2.id, userId: users[1].id, score: 0, isWinner: false, goldWon: new Prisma.Decimal('0.00') } }),
    prisma.matchParticipation.create({ data: { matchId: match2.id, userId: users[2].id, score: 0, isWinner: false, goldWon: new Prisma.Decimal('0.00') } }),
  ]);

  // Update User A totalPoints (3 from match 1)
  await prisma.user.update({ where: { id: users[0].id }, data: { totalPoints: 3 } });

  // eslint-disable-next-line no-console
  console.log('[seed] MatchParticipation: 7 (match1: 4, match2: 3)');

  // ───────────────────────────────────────────────
  // 8. Statistics (vote counts per criterion)
  // ───────────────────────────────────────────────
  await Promise.all([
    prisma.statistic.create({ data: { matchId: match1.id, criterionId: criteriaM1[0].id, totalHomeVotes: 2, totalAwayVotes: 2 } }),
    prisma.statistic.create({ data: { matchId: match1.id, criterionId: criteriaM1[1].id, totalHomeVotes: 1, totalAwayVotes: 3 } }),
    prisma.statistic.create({ data: { matchId: match1.id, criterionId: criteriaM1[2].id, totalHomeVotes: 3, totalAwayVotes: 1 } }),
    prisma.statistic.create({ data: { matchId: match2.id, criterionId: criteriaM2[0].id, totalHomeVotes: 3, totalAwayVotes: 0 } }),
    prisma.statistic.create({ data: { matchId: match2.id, criterionId: criteriaM2[1].id, totalHomeVotes: 3, totalAwayVotes: 0 } }),
    prisma.statistic.create({ data: { matchId: match2.id, criterionId: criteriaM2[2].id, totalHomeVotes: 3, totalAwayVotes: 0 } }),
    prisma.statistic.create({ data: { matchId: match3.id, criterionId: criteriaM3[0].id, totalHomeVotes: 2, totalAwayVotes: 1 } }),
    prisma.statistic.create({ data: { matchId: match3.id, criterionId: criteriaM3[1].id, totalHomeVotes: 2, totalAwayVotes: 0 } }),
    prisma.statistic.create({ data: { matchId: match3.id, criterionId: criteriaM3[2].id, totalHomeVotes: 0, totalAwayVotes: 1 } }),
  ]);

  // eslint-disable-next-line no-console
  console.log('[seed] Statistics: 9');

  // ───────────────────────────────────────────────
  // 9. Comments
  // ───────────────────────────────────────────────
  await Promise.all([
    prisma.comment.create({ data: { matchId: match1.id, userId: users[0].id, content: 'Trận đấu quá hay! MUN xứng đáng thắng 🔥', status: CommentStatus.VISIBLE } }),
    prisma.comment.create({ data: { matchId: match1.id, userId: users[1].id, content: 'Tiếc quá, tưởng LIV sẽ gỡ được', status: CommentStatus.VISIBLE } }),
    prisma.comment.create({ data: { matchId: match1.id, userId: users[2].id, content: 'Rashford chơi rất tốt hôm nay', status: CommentStatus.VISIBLE } }),
    prisma.comment.create({ data: { matchId: match2.id, userId: users[0].id, content: 'Trận này chán quá, không ai ghi bàn', status: CommentStatus.VISIBLE } }),
    prisma.comment.create({ data: { matchId: match2.id, userId: users[1].id, content: 'ARS phòng ngự quá chắc', status: CommentStatus.VISIBLE } }),
    prisma.comment.create({ data: { matchId: match3.id, userId: users[0].id, content: 'Haaland sẽ ghi bàn hôm nay!', status: CommentStatus.VISIBLE } }),
    prisma.comment.create({ data: { matchId: match3.id, userId: users[4].id, content: 'Son Heung-min sẽ tỏa sáng', status: CommentStatus.VISIBLE } }),
    prisma.comment.create({ data: { matchId: match1.id, userId: users[3].id, content: 'Spam nội dung xấu', status: CommentStatus.HIDDEN } }),
  ]);

  // eslint-disable-next-line no-console
  console.log('[seed] Comments: 8 (7 visible, 1 hidden)');

  // ───────────────────────────────────────────────
  // 10. Notifications
  // ───────────────────────────────────────────────
  await Promise.all([
    // Match 1 results
    prisma.notification.create({ data: { userId: users[0].id, type: NotificationType.MATCH_WON, title: 'Bạn đã thắng trận!', body: 'Bạn đoán đúng 3 tiêu chí và nhận 400.00 gold.', matchId: match1.id, isRead: true } }),
    prisma.notification.create({ data: { userId: users[1].id, type: NotificationType.MATCH_LOST, title: 'Kết quả trận đấu', body: 'Bạn đoán đúng 2 tiêu chí. Chúc may mắn lần sau!', matchId: match1.id, isRead: false } }),
    prisma.notification.create({ data: { userId: users[2].id, type: NotificationType.MATCH_LOST, title: 'Kết quả trận đấu', body: 'Bạn đoán đúng 1 tiêu chí. Chúc may mắn lần sau!', matchId: match1.id, isRead: false } }),
    prisma.notification.create({ data: { userId: users[3].id, type: NotificationType.MATCH_LOST, title: 'Kết quả trận đấu', body: 'Bạn đoán đúng 0 tiêu chí. Chúc may mắn lần sau!', matchId: match1.id, isRead: false } }),
    // Match 2 results (all lost)
    prisma.notification.create({ data: { userId: users[0].id, type: NotificationType.MATCH_LOST, title: 'Kết quả trận đấu', body: 'Bạn đoán đúng 0 tiêu chí. Chúc may mắn lần sau!', matchId: match2.id, isRead: false } }),
    prisma.notification.create({ data: { userId: users[1].id, type: NotificationType.MATCH_LOST, title: 'Kết quả trận đấu', body: 'Bạn đoán đúng 0 tiêu chí. Chúc may mắn lần sau!', matchId: match2.id, isRead: false } }),
    prisma.notification.create({ data: { userId: users[2].id, type: NotificationType.MATCH_LOST, title: 'Kết quả trận đấu', body: 'Bạn đoán đúng 0 tiêu chí. Chúc may mắn lần sau!', matchId: match2.id, isRead: false } }),
    // Match 5 cancelled
    prisma.notification.create({ data: { userId: users[0].id, type: NotificationType.MATCH_CANCELLED, title: 'Trận đấu đã bị huỷ', body: 'Trận bạn tham gia đã bị huỷ. Kết quả của trận này không được tính.', matchId: match5.id, isRead: false } }),
  ]);

  // eslint-disable-next-line no-console
  console.log('[seed] Notifications: 8');

  // ───────────────────────────────────────────────
  // 11. ChatbotConversations
  // ───────────────────────────────────────────────
  await Promise.all([
    prisma.chatbotConversation.create({
      data: {
        userId: users[0].id,
        message: 'Hôm nay có trận nào không?',
        response: 'Hôm nay có trận Man City vs Tottenham đang diễn ra. Bạn có thể xem chi tiết trong danh sách trận đấu.',
      },
    }),
    prisma.chatbotConversation.create({
      data: {
        userId: users[1].id,
        message: 'Tỉ lệ thắng của tôi là bao nhiêu?',
        response: 'Bạn đã tham gia 2 trận và chưa thắng trận nào. Bạn đoán đúng tổng cộng 2 tiêu chí. Hãy tiếp tục cố gắng!',
      },
    }),
    prisma.chatbotConversation.create({
      data: {
        userId: users[0].id,
        message: 'Luật tính điểm như thế nào?',
        response: 'Mỗi tiêu chí bạn đoán đúng sẽ được +1 điểm. Người có điểm cao nhất (tối thiểu 1) sẽ thắng và chia đều pool gold. Pool = entry_gold × số người tham gia.',
      },
    }),
  ]);

  // eslint-disable-next-line no-console
  console.log('[seed] ChatbotConversations: 3');

  // ───────────────────────────────────────────────
  // 12. PasswordResetTokens
  // ───────────────────────────────────────────────
  const expiredTokenHash = await bcrypt.hash('expired-token-sample', 10);
  const usedTokenHash = await bcrypt.hash('used-token-sample', 10);

  await Promise.all([
    prisma.passwordResetToken.create({
      data: {
        userId: users[1].id,
        tokenHash: expiredTokenHash,
        expiresAt: new Date(now.getTime() - 1 * day),
      },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: users[2].id,
        tokenHash: usedTokenHash,
        expiresAt: new Date(now.getTime() + 1 * day),
        usedAt: new Date(now.getTime() - 6 * hour),
      },
    }),
  ]);

  // eslint-disable-next-line no-console
  console.log('[seed] PasswordResetTokens: 2 (1 expired, 1 used)');

  // eslint-disable-next-line no-console
  console.log('\n[seed] ✅ Seed complete! Summary:');
  // eslint-disable-next-line no-console
  console.log('  Users:                6 (1 admin + 5 users)');
  // eslint-disable-next-line no-console
  console.log('  Teams:                6');
  // eslint-disable-next-line no-console
  console.log('  Players:              18 (3 per team)');
  // eslint-disable-next-line no-console
  console.log('  Matches:              5 (FINISHED×2, LIVE×1, SCHEDULED×1, CANCELLED×1)');
  // eslint-disable-next-line no-console
  console.log('  PredictionCriteria:   11');
  // eslint-disable-next-line no-console
  console.log('  Predictions:          31');
  // eslint-disable-next-line no-console
  console.log('  MatchParticipations:  7');
  // eslint-disable-next-line no-console
  console.log('  Statistics:           9');
  // eslint-disable-next-line no-console
  console.log('  Comments:             8');
  // eslint-disable-next-line no-console
  console.log('  Notifications:        8');
  // eslint-disable-next-line no-console
  console.log('  ChatbotConversations: 3');
  // eslint-disable-next-line no-console
  console.log('  PasswordResetTokens:  2');
  // eslint-disable-next-line no-console
  console.log('\n  Login: admin@football-lover.local / Admin12345');
  // eslint-disable-next-line no-console
  console.log('  Login: nguyenvana@example.com / Password123');
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
