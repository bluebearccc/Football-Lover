import type { Request, Response } from 'express';
import { commentsService } from './comments.service';
import type { ListCommentsQuery, SetCommentStatusInput } from './comments.dto';

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
};
