import { Router } from 'express';
import { wrap } from '../../utils/asyncHandler';
import { validateQuery } from '../../middleware/validate';
import { dashboardQuerySchema } from './dashboard.dto';
import { dashboardController } from './dashboard.controller';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', validateQuery(dashboardQuerySchema), wrap(dashboardController.overview));
dashboardRoutes.get('/export', validateQuery(dashboardQuerySchema), wrap(dashboardController.exportCsv));
