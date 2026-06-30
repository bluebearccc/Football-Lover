import { z } from 'zod';

export const createCriterionTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Tên tiêu chí không được để trống').max(120),
  description: z.string().trim().max(500).optional(),
});

export const updateCriterionTemplateSchema = createCriterionTemplateSchema.partial();

export type CreateCriterionTemplateInput = z.infer<typeof createCriterionTemplateSchema>;
export type UpdateCriterionTemplateInput = z.infer<typeof updateCriterionTemplateSchema>;
