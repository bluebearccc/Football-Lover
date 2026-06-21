import { Router } from 'express';
import { validateBody, validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { usersController } from './users.controller';
import { listUsersQuerySchema, setRoleSchema, setStatusSchema } from './users.dto';

// Mounted under /api/v1/admin/users (guarded).
export const usersRoutes = Router();

usersRoutes.get('/', validateQuery(listUsersQuerySchema), wrap(usersController.list));
usersRoutes.get('/:id', wrap(usersController.getDetail));
usersRoutes.patch('/:id/status', validateBody(setStatusSchema), wrap(usersController.setStatus));
usersRoutes.patch('/:id/role', validateBody(setRoleSchema), wrap(usersController.setRole));
