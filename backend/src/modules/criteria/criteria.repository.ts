import type { Match, Prisma, PredictionCriterion } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const criteriaRepository = {
  findMatch(matchId: string): Promise<Match | null> {
    return prisma.match.findUnique({ where: { id: matchId } });
  },

  findByMatch(matchId: string): Promise<PredictionCriterion[]> {
    return prisma.predictionCriterion.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
    });
  },

  findActiveByMatch(matchId: string): Promise<PredictionCriterion[]> {
    return prisma.predictionCriterion.findMany({
      where: { matchId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  findById(id: string): Promise<PredictionCriterion | null> {
    return prisma.predictionCriterion.findUnique({ where: { id } });
  },

  create(data: Prisma.PredictionCriterionCreateInput): Promise<PredictionCriterion> {
    return prisma.predictionCriterion.create({ data });
  },

  update(id: string, data: Prisma.PredictionCriterionUpdateInput): Promise<PredictionCriterion> {
    return prisma.predictionCriterion.update({ where: { id }, data });
  },

  createMany(
    matchId: string,
    templates: { name: string; description: string | null }[],
  ): Promise<Prisma.BatchPayload> {
    return prisma.predictionCriterion.createMany({
      data: templates.map((t) => ({
        matchId,
        name: t.name,
        description: t.description,
      })),
    });
  },

  async hasPredictions(id: string): Promise<boolean> {
    const count = await prisma.prediction.count({ where: { criterionId: id } });
    return count > 0;
  },

  async delete(id: string): Promise<void> {
    await prisma.predictionCriterion.delete({ where: { id } });
  },
};
