import { Router } from 'express';
import { tryAuthenticate } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { publicMatchesController } from './public-matches.controller';
import { listPublicMatchesQuerySchema } from './public-matches.dto';

export const publicMatchesRoutes = Router();

publicMatchesRoutes.get(
  '/',
  validateQuery(listPublicMatchesQuerySchema),
  wrap(publicMatchesController.list),
);

publicMatchesRoutes.get('/:id', tryAuthenticate, wrap(publicMatchesController.getById));
