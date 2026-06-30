import type { CriterionTemplate } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { criterionTemplateRepository } from './criterion-templates.repository';
import type { CreateCriterionTemplateInput, UpdateCriterionTemplateInput } from './criterion-templates.dto';

async function ensureTemplate(id: string): Promise<CriterionTemplate> {
  const template = await criterionTemplateRepository.findById(id);
  if (!template) throw ApiError.notFound('Không tìm thấy tiêu chí mặc định');
  return template;
}

export const criterionTemplateService = {
  list(): Promise<CriterionTemplate[]> {
    return criterionTemplateRepository.findAll();
  },

  create(input: CreateCriterionTemplateInput): Promise<CriterionTemplate> {
    return criterionTemplateRepository.create({
      name: input.name,
      description: input.description,
    });
  },

  async update(id: string, input: UpdateCriterionTemplateInput): Promise<CriterionTemplate> {
    await ensureTemplate(id);
    return criterionTemplateRepository.update(id, {
      name: input.name,
      description: input.description,
    });
  },

  async remove(id: string): Promise<void> {
    await ensureTemplate(id);
    await criterionTemplateRepository.delete(id);
  },

  async deactivate(id: string): Promise<CriterionTemplate> {
    await ensureTemplate(id);
    return criterionTemplateRepository.update(id, { isActive: false });
  },

  async reactivate(id: string): Promise<CriterionTemplate> {
    await ensureTemplate(id);
    return criterionTemplateRepository.update(id, { isActive: true });
  },
};
