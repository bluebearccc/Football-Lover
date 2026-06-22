import type { Request, Response } from 'express';
import { publicMatchesService } from './public-matches.service';
import type { ListPublicMatchesQuery } from './public-matches.dto';

export const publicMatchesController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await publicMatchesService.listPublic(
      req.query as unknown as ListPublicMatchesQuery,
    );
    res.status(200).json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const viewerId = req.user?.id;
    const result = await publicMatchesService.getDetailedPublic(req.params.id, viewerId);
    res.status(200).json(result);
  },
};
