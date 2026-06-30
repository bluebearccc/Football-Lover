import type { CriterionTemplate, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const criterionTemplateRepository = {
  findAll(): Promise<CriterionTemplate[]> {
    return prisma.criterionTemplate.findMany({ orderBy: { createdAt: 'asc' } });
  },

  findActive(): Promise<CriterionTemplate[]> {
    return prisma.criterionTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  findById(id: string): Promise<CriterionTemplate | null> {
    return prisma.criterionTemplate.findUnique({ where: { id } });
  },

  create(data: Prisma.CriterionTemplateCreateInput): Promise<CriterionTemplate> {
    return prisma.criterionTemplate.create({ data });
  },

  update(id: string, data: Prisma.CriterionTemplateUpdateInput): Promise<CriterionTemplate> {
    return prisma.criterionTemplate.update({ where: { id }, data });
  },

  delete(id: string): Promise<void> {
    return prisma.criterionTemplate.delete({ where: { id } }).then(() => undefined);
  },
};
