import type { Request, Response } from 'express';
import { adminLogService } from '../admin-log/admin-log.service';
import { matchesService } from './matches.service';
import type {
  CreateMatchInput,
  ListMatchesQuery,
  SetCriterionResultInput,
  UpdateMatchInput,
  UpdateResultInput,
} from './matches.dto';

export const matchesController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await matchesService.list(req.query as unknown as ListMatchesQuery);
    res.status(200).json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const match = await matchesService.getById(req.params.id);
    res.status(200).json(match);
  },

  async create(req: Request, res: Response): Promise<void> {
    const match = await matchesService.create(req.body as CreateMatchInput);
    await adminLogService.logAction(req.user!.id, {
      action: 'MATCH_CREATE',
      description: `Trận đấu mới đã được tạo`,
      entityType: 'Match',
      entityId: match.id,
    });
    res.status(201).json(match);
  },

  async update(req: Request, res: Response): Promise<void> {
    const match = await matchesService.update(req.params.id, req.body as UpdateMatchInput);
    await adminLogService.logAction(req.user!.id, {
      action: 'MATCH_EDIT',
      description: `Trận đấu đã được cập nhật`,
      entityType: 'Match',
      entityId: req.params.id,
    });
    res.status(200).json(match);
  },

  async updateResult(req: Request, res: Response): Promise<void> {
    const summary = await matchesService.updateResult(req.params.id, req.body as UpdateResultInput);
    await adminLogService.logAction(req.user!.id, {
      action: 'MATCH_SETTLE',
      description: `Trận đấu đã kết thúc — đã tính điểm`,
      entityType: 'Match',
      entityId: req.params.id,
    });
    res.status(200).json(summary);
  },

  async setCriterionResult(req: Request, res: Response): Promise<void> {
    const { resultTeam } = req.body as SetCriterionResultInput;
    const criterion = await matchesService.setCriterionResult(req.params.criterionId, resultTeam);
    res.status(200).json(criterion);
  },

  async cancel(req: Request, res: Response): Promise<void> {
    await matchesService.cancel(req.params.id);
    await adminLogService.logAction(req.user!.id, {
      action: 'MATCH_CANCEL',
      description: `Trận đấu đã bị huỷ`,
      entityType: 'Match',
      entityId: req.params.id,
    });
    res.status(200).json({ message: 'Đã huỷ trận đấu' });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const result = await matchesService.remove(req.params.id);
    res.status(200).json(result);
  },
};
