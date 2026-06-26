import type { Request, Response } from 'express';
import { adminLogService } from '../admin-log/admin-log.service';
import { criteriaService } from './criteria.service';
import type { CreateCriterionInput, UpdateCriterionInput } from './criteria.dto';

export const criteriaController = {
  async listByMatch(req: Request, res: Response): Promise<void> {
    const items = await criteriaService.listByMatch(req.params.matchId);
    res.status(200).json({ items });
  },

  async create(req: Request, res: Response): Promise<void> {
    const created = await criteriaService.create(req.params.matchId, req.body as CreateCriterionInput);
    await adminLogService.logAction(req.user!.id, {
      action: 'CRITERIA_UPDATE',
      description: `Tiêu chí dự đoán đã được tạo cho trận`,
      entityType: 'PredictionCriterion',
      entityId: created.id,
    });
    res.status(201).json(created);
  },

  async update(req: Request, res: Response): Promise<void> {
    const updated = await criteriaService.update(req.params.id, req.body as UpdateCriterionInput);
    await adminLogService.logAction(req.user!.id, {
      action: 'CRITERIA_UPDATE',
      description: `Tiêu chí dự đoán đã được cập nhật`,
      entityType: 'PredictionCriterion',
      entityId: req.params.id,
    });
    res.status(200).json(updated);
  },

  async remove(req: Request, res: Response): Promise<void> {
    await criteriaService.remove(req.params.id);
    res.status(204).send();
  },

  async deactivate(req: Request, res: Response): Promise<void> {
    const criterion = await criteriaService.deactivate(req.params.id);
    res.status(200).json(criterion);
  },

  async reactivate(req: Request, res: Response): Promise<void> {
    const criterion = await criteriaService.reactivate(req.params.id);
    res.status(200).json(criterion);
  },
};
