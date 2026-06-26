import { Router } from 'express';
import { wrap } from '../../utils/asyncHandler';
import { validateQuery } from '../../middleware/validate';
import { adminLogQuerySchema } from './admin-log.dto';
import { adminLogController } from './admin-log.controller';

export const adminLogRoutes = Router();

adminLogRoutes.get('/', validateQuery(adminLogQuerySchema), wrap(adminLogController.list));
