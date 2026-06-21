import { Router } from 'express';
import { validateBody, validateQuery } from '../../middleware/validate';
import { wrap } from '../../utils/asyncHandler';
import { teamsController } from './teams.controller';
import {
  createPlayerSchema,
  createTeamSchema,
  listTeamsQuerySchema,
  updatePlayerSchema,
  updateTeamSchema,
} from './teams.dto';

// Mounted under /api/v1/admin/teams (guarded by authenticate + requireRole('ADMIN')).
export const teamsRoutes = Router();

teamsRoutes.get('/', validateQuery(listTeamsQuerySchema), wrap(teamsController.list));
teamsRoutes.post('/', validateBody(createTeamSchema), wrap(teamsController.create));
teamsRoutes.get('/:id', wrap(teamsController.getById));
teamsRoutes.patch('/:id', validateBody(updateTeamSchema), wrap(teamsController.update));
teamsRoutes.delete('/:id', wrap(teamsController.remove));

// Players
teamsRoutes.post('/:id/players', validateBody(createPlayerSchema), wrap(teamsController.addPlayer));
teamsRoutes.patch(
  '/:id/players/:playerId',
  validateBody(updatePlayerSchema),
  wrap(teamsController.updatePlayer),
);
teamsRoutes.delete('/:id/players/:playerId', wrap(teamsController.removePlayer));
