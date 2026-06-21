import { Router } from 'express';
import { validateBody, validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { commentsController } from './comments.controller';
import { listCommentsQuerySchema, setCommentStatusSchema } from './comments.dto';

// Mounted under /api/v1/admin/comments (guarded).
export const commentsRoutes = Router();

commentsRoutes.get('/', validateQuery(listCommentsQuerySchema), wrap(commentsController.list));
commentsRoutes.patch(
  '/:id/status',
  validateBody(setCommentStatusSchema),
  wrap(commentsController.setStatus),
);
