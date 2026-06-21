import { Router } from 'express';
import { wrap } from '../../utils/asyncHandler';
import { dashboardController } from './dashboard.controller';

// Mounted under /api/v1/admin/dashboard (guarded).
export const dashboardRoutes = Router();

dashboardRoutes.get('/', wrap(dashboardController.overview));
