import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { criterionTemplateController } from './criterion-templates.controller';
import { createCriterionTemplateSchema, updateCriterionTemplateSchema } from './criterion-templates.dto';

// Mounted under /api/v1/admin/criterion-templates (guarded).
export const criterionTemplatesRoutes = Router();

criterionTemplatesRoutes.get('/', wrap(criterionTemplateController.list));
criterionTemplatesRoutes.post(
  '/',
  validateBody(createCriterionTemplateSchema),
  wrap(criterionTemplateController.create),
);
criterionTemplatesRoutes.patch(
  '/:id',
  validateBody(updateCriterionTemplateSchema),
  wrap(criterionTemplateController.update),
);
criterionTemplatesRoutes.post('/:id/deactivate', wrap(criterionTemplateController.deactivate));
criterionTemplatesRoutes.post('/:id/reactivate', wrap(criterionTemplateController.reactivate));
criterionTemplatesRoutes.delete('/:id', wrap(criterionTemplateController.remove));
