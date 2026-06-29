import type { Request, Response } from 'express';
import { profileService } from './profile.service';
import type { HistoryQuery } from './profile.dto';

export const profileController = {
  async getMe(req: Request, res: Response): Promise<void> {
    const result = await profileService.getMyProfile(req.user!.id);
    res.status(200).json(result);
  },

  async getHistory(req: Request, res: Response): Promise<void> {
    const result = await profileService.getMyHistory(req.user!.id, req.query as unknown as HistoryQuery);
    res.status(200).json(result);
  },
};
