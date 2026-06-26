import { prisma } from '../../lib/prisma';

export const userContextService = {
  async buildSafeContext(userId: string): Promise<string> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [user, predictions, participations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          displayName: true,
          role: true,
          totalPoints: true,
        },
      }),

      prisma.prediction.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          selectedTeam: true,
          isCorrect: true,
          createdAt: true,
          match: {
            select: {
              matchTime: true,
              status: true,
              homeScore: true,
              awayScore: true,
              homeTeam: { select: { name: true } },
              awayTeam: { select: { name: true } },
            },
          },
          criterion: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),

      prisma.matchParticipation.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          match: {
            select: {
              matchTime: true,
              status: true,
              homeTeam: { select: { name: true } },
              awayTeam: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    const parts: string[] = [];

    if (user) {
      parts.push(`Người dùng: ${user.displayName}, vai trò: ${user.role}, tổng điểm: ${user.totalPoints}.`);
    }

    if (predictions.length > 0) {
      const predSummary = predictions.map((p) => {
        const match = `${p.match.homeTeam.name} vs ${p.match.awayTeam.name}`;
        const result = p.isCorrect === null ? 'chưa có kết quả' : p.isCorrect ? 'đúng' : 'sai';
        return `  - ${match} (${p.criterion.name}): chọn ${p.selectedTeam}, ${result}`;
      });
      parts.push(`Dự đoán gần đây (30 ngày):\n${predSummary.join('\n')}`);
    }

    if (participations.length > 0) {
      const partSummary = participations.map((p) => {
        const match = `${p.match.homeTeam.name} vs ${p.match.awayTeam.name}`;
        const status = p.isWinner === null ? 'chưa có kết quả' : p.isWinner ? `thắng (${p.goldWon} gold)` : 'thua';
        return `  - ${match}: ${status}`;
      });
      parts.push(`Kết quả tham gia trận (30 ngày):\n${partSummary.join('\n')}`);
    }

    return parts.join('\n\n');
  },
};
