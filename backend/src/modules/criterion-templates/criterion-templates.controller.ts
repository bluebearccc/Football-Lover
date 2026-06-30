import type { Request, Response } from 'express';
import { adminLogService } from '../admin-log/admin-log.service';
import { criterionTemplateService } from './criterion-templates.service';
import type { CreateCriterionTemplateInput, UpdateCriterionTemplateInput } from './criterion-templates.dto';

export const criterionTemplateController = {
  async list(_req: Request, res: Response): Promise<void> {
    const items = await criterionTemplateService.list();
    res.status(200).json({ items });
  },

  async create(req: Request, res: Response): Promise<void> {
    const created = await criterionTemplateService.create(req.body as CreateCriterionTemplateInput);
    await adminLogService.logAction(req.user!.id, {
      action: 'CRITERIA_TEMPLATE_UPDATE',
      description: `Tiêu chí mặc định "${created.name}" đã được tạo`,
      entityType: 'CriterionTemplate',
      entityId: created.id,
    });
    res.status(201).json(created);
  },

  async update(req: Request, res: Response): Promise<void> {
    const updated = await criterionTemplateService.update(req.params.id, req.body as UpdateCriterionTemplateInput);
    await adminLogService.logAction(req.user!.id, {
      action: 'CRITERIA_TEMPLATE_UPDATE',
      description: `Tiêu chí mặc định đã được cập nhật`,
      entityType: 'CriterionTemplate',
      entityId: req.params.id,
    });
    res.status(200).json(updated);
  },

  async remove(req: Request, res: Response): Promise<void> {
    await criterionTemplateService.remove(req.params.id);
    res.status(204).send();
  },

  async deactivate(req: Request, res: Response): Promise<void> {
    const template = await criterionTemplateService.deactivate(req.params.id);
    res.status(200).json(template);
  },

  async reactivate(req: Request, res: Response): Promise<void> {
    const template = await criterionTemplateService.reactivate(req.params.id);
    res.status(200).json(template);
  },
};
