import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { publicMatchesRoutes } from '../modules/public-matches/public-matches.routes';
import { leaderboardRoutes } from '../modules/leaderboard/leaderboard.routes';
import { notificationsRoutes } from '../modules/notifications/notifications.routes';
import { chatbotRoutes } from '../modules/chatbot/chatbot.routes';
import { adminRoutes } from './admin.routes';

const router = Router();

// Mount domain modules here. Real UC modules (matches, predictions, teams,
// notifications, ...) follow the same layered pattern as `modules/auth`.
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/matches', publicMatchesRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/chatbot', chatbotRoutes);
// Admin surface (UC06/07/12/13 + manage users + moderation + dashboard).
router.use('/admin', adminRoutes);

export default router;
