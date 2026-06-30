import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { trackLastActive } from '../middleware/lastActive';
import { adminLogRoutes } from '../modules/admin-log/admin-log.routes';
import { commentsRoutes } from '../modules/comments/comments.routes';
import { criteriaRoutes } from '../modules/criteria/criteria.routes';
import { criterionTemplatesRoutes } from '../modules/criterion-templates/criterion-templates.routes';
import { dashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { matchesRoutes } from '../modules/matches/matches.routes';
import { syncRoutes } from '../modules/sync/sync.routes';
import { teamsRoutes } from '../modules/teams/teams.routes';
import { uploadsRoutes } from '../modules/uploads/uploads.routes';
import { usersRoutes } from '../modules/users/users.routes';

/**
 * Admin surface (UC06, UC07, UC12, UC13 + manage users + comment moderation + dashboard).
 * Every route below requires a valid JWT and the ADMIN role (BR10/BR11/AC-12-02).
 */
export const adminRoutes = Router();

adminRoutes.use(authenticate, trackLastActive, requireRole('ADMIN'));

adminRoutes.use('/dashboard', dashboardRoutes);
adminRoutes.use('/logs', adminLogRoutes);
adminRoutes.use('/teams', teamsRoutes);
adminRoutes.use('/matches', matchesRoutes);
adminRoutes.use('/criteria', criteriaRoutes);
adminRoutes.use('/criterion-templates', criterionTemplatesRoutes);
adminRoutes.use('/users', usersRoutes);
adminRoutes.use('/comments', commentsRoutes);
adminRoutes.use('/uploads', uploadsRoutes);
adminRoutes.use('/sync', syncRoutes);
