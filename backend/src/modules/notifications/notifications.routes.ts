import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { notificationsController } from './notifications.controller';
import { notificationListQuerySchema } from './notifications.dto';

export const notificationsRoutes = Router();

notificationsRoutes.get(
  '/',
  authenticate,
  validateQuery(notificationListQuerySchema),
  wrap(notificationsController.list),
);

notificationsRoutes.get(
  '/unread-count',
  authenticate,
  wrap(notificationsController.unreadCount),
);

notificationsRoutes.patch(
  '/mark-all-read',
  authenticate,
  wrap(notificationsController.markAllRead),
);

notificationsRoutes.patch(
  '/:id/read',
  authenticate,
  wrap(notificationsController.markRead),
);
