import { Router } from 'express';
import { authenticate, tryAuthenticate } from '../../middleware/auth';
import { trackLastActive } from '../../middleware/lastActive';
import { validateBody, validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { publicMatchesController } from './public-matches.controller';
import { listPublicMatchesQuerySchema } from './public-matches.dto';
import { commentsController } from '../comments/comments.controller';
import { createCommentSchema } from '../comments/comments.dto';

export const publicMatchesRoutes = Router();

publicMatchesRoutes.get(
  '/',
  validateQuery(listPublicMatchesQuerySchema),
  wrap(publicMatchesController.list),
);

publicMatchesRoutes.get('/:id', tryAuthenticate, wrap(publicMatchesController.getById));
publicMatchesRoutes.get('/:id/results', wrap(publicMatchesController.getResults));
publicMatchesRoutes.post(
  '/:id/comments',
  authenticate,
  trackLastActive,
  validateBody(createCommentSchema),
  wrap(commentsController.create),
);
