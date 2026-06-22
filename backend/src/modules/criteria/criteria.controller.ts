import type { Request, Response } from 'express';
import { criteriaService } from './criteria.service';
import type { CreateCriterionInput, UpdateCriterionInput } from './criteria.dto';

export const criteriaController = {
  async listByMatch(req: Request, res: Response): Promise<void> {
    const items = await criteriaService.listByMatch(req.params.matchId);
    res.status(200).json({ items });
  },

  async create(req: Request, res: Response): Promise<void> {
    const created = await criteriaService.create(req.params.matchId, req.body as CreateCriterionInput);
    res.status(201).json(created);
  },

  async update(req: Request, res: Response): Promise<void> {
    const updated = await criteriaService.update(req.params.id, req.body as UpdateCriterionInput);
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
};
