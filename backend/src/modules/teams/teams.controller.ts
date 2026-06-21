import type { Request, Response } from 'express';
import { teamsService } from './teams.service';
import type {
  CreatePlayerInput,
  CreateTeamInput,
  ListTeamsQuery,
  UpdatePlayerInput,
  UpdateTeamInput,
} from './teams.dto';

export const teamsController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await teamsService.list(req.query as unknown as ListTeamsQuery);
    res.status(200).json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const team = await teamsService.getById(req.params.id);
    res.status(200).json(team);
  },

  async create(req: Request, res: Response): Promise<void> {
    const team = await teamsService.create(req.body as CreateTeamInput);
    res.status(201).json(team);
  },

  async update(req: Request, res: Response): Promise<void> {
    const team = await teamsService.update(req.params.id, req.body as UpdateTeamInput);
    res.status(200).json(team);
  },

  async remove(req: Request, res: Response): Promise<void> {
    const result = await teamsService.remove(req.params.id);
    res.status(200).json(result);
  },

  async addPlayer(req: Request, res: Response): Promise<void> {
    const player = await teamsService.addPlayer(req.params.id, req.body as CreatePlayerInput);
    res.status(201).json(player);
  },

  async updatePlayer(req: Request, res: Response): Promise<void> {
    const player = await teamsService.updatePlayer(
      req.params.playerId,
      req.body as UpdatePlayerInput,
    );
    res.status(200).json(player);
  },

  async removePlayer(req: Request, res: Response): Promise<void> {
    await teamsService.removePlayer(req.params.playerId);
    res.status(204).send();
  },
};
