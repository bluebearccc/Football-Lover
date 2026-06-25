import type { Request, Response } from 'express';
import { commentsService } from './comments.service';
import type { CreateCommentInput, ListCommentsQuery, SetCommentStatusInput } from './comments.dto';

export const commentsController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await commentsService.list(req.query as unknown as ListCommentsQuery);
    res.status(200).json(result);
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.body as SetCommentStatusInput;
    const comment = await commentsService.setStatus(req.params.id, status);
    res.status(200).json(comment);
  },

  async create(req: Request, res: Response): Promise<void> {
    const { content } = req.body as CreateCommentInput;
    const userId = req.user!.id;
    const matchId = req.params.id;
    const comment = await commentsService.create(userId, matchId, content);
    res.status(201).json(comment);
  },
};
