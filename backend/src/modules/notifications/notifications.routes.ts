import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { trackLastActive } from '../../middleware/lastActive';
import { validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { notificationsController } from './notifications.controller';
import { notificationListQuerySchema } from './notifications.dto';

export const notificationsRoutes = Router();

notificationsRoutes.get(
  '/',
  authenticate,
  trackLastActive,
  validateQuery(notificationListQuerySchema),
  wrap(notificationsController.list),
);

notificationsRoutes.get(
  '/unread-count',
  authenticate,
  trackLastActive,
  wrap(notificationsController.unreadCount),
);

notificationsRoutes.patch(
  '/mark-all-read',
  authenticate,
  trackLastActive,
  wrap(notificationsController.markAllRead),
);

notificationsRoutes.patch(
  '/:id/read',
  authenticate,
  trackLastActive,
  wrap(notificationsController.markRead),
);
