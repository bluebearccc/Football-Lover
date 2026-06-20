import { Router } from 'express';
import { healthController } from './health.controller';

export const healthRoutes = Router();

// GET /api/v1/health
healthRoutes.get('/', (req, res, next) => {
  healthController.get(req, res).catch(next);
});
