import { Router } from 'express';
import { validateBody, validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { matchesController } from './matches.controller';
import {
  createMatchSchema,
  listMatchesQuerySchema,
  setCriterionResultSchema,
  updateMatchSchema,
  updateResultSchema,
} from './matches.dto';

// Mounted under /api/v1/admin/matches (guarded).
export const matchesRoutes = Router();

matchesRoutes.get('/', validateQuery(listMatchesQuerySchema), wrap(matchesController.list));
matchesRoutes.post('/', validateBody(createMatchSchema), wrap(matchesController.create));
matchesRoutes.get('/:id', wrap(matchesController.getById));
matchesRoutes.patch('/:id', validateBody(updateMatchSchema), wrap(matchesController.update));
matchesRoutes.put('/:id/result', validateBody(updateResultSchema), wrap(matchesController.updateResult));
matchesRoutes.put(
  '/criteria/:criterionId/result',
  validateBody(setCriterionResultSchema),
  wrap(matchesController.setCriterionResult),
);
matchesRoutes.post('/:id/cancel', wrap(matchesController.cancel));
matchesRoutes.delete('/:id', wrap(matchesController.remove));
