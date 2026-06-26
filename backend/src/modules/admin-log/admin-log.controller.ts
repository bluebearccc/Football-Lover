import type { Request, Response } from 'express';
import { adminLogService } from './admin-log.service';

export const adminLogController = {
  async list(req: Request, res: Response): Promise<void> {
    const { page, pageSize, action, from, to } = req.query as Record<string, string | undefined>;
    const result = await adminLogService.getLogs({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      action,
      from,
      to,
    });
    res.status(200).json(result);
  },
};
