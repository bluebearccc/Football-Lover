import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { criteriaController } from './criteria.controller';
import { createCriterionSchema, updateCriterionSchema } from './criteria.dto';

// Mounted under /api/v1/admin/criteria (guarded).
export const criteriaRoutes = Router();

criteriaRoutes.get('/match/:matchId', wrap(criteriaController.listByMatch));
criteriaRoutes.post(
  '/match/:matchId',
  validateBody(createCriterionSchema),
  wrap(criteriaController.create),
);
criteriaRoutes.patch('/:id', validateBody(updateCriterionSchema), wrap(criteriaController.update));
criteriaRoutes.post('/:id/deactivate', wrap(criteriaController.deactivate));
criteriaRoutes.delete('/:id', wrap(criteriaController.remove));
