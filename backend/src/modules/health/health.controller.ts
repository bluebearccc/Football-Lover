import type { Request, Response } from 'express';
import { healthService } from './health.service';

export const healthController = {
  async get(_req: Request, res: Response): Promise<void> {
    const result = await healthService.check();
    res.status(200).json(result);
  },
};
