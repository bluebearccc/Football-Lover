import type { Request, Response } from 'express';
import type { NotificationListQuery } from './notifications.dto';
import { notificationsService } from './notifications.service';

export const notificationsController = {
  async list(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { page, pageSize } = req.query as unknown as NotificationListQuery;
    const result = await notificationsService.list(userId, page, pageSize);
    res.status(200).json(result);
  },

  async unreadCount(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await notificationsService.unreadCount(userId);
    res.status(200).json(result);
  },

  async markRead(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { id } = req.params;
    await notificationsService.markRead(id, userId);
    res.status(200).json({ message: 'OK' });
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const result = await notificationsService.markAllRead(userId);
    res.status(200).json(result);
  },
};
