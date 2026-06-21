import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';
import { usersService } from './users.service';
import type { ListUsersQuery, SetRoleInput, SetStatusInput } from './users.dto';

function actorId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const usersController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await usersService.list(req.query as unknown as ListUsersQuery);
    res.status(200).json(result);
  },

  async getDetail(req: Request, res: Response): Promise<void> {
    const user = await usersService.getDetail(req.params.id);
    res.status(200).json(user);
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.body as SetStatusInput;
    const user = await usersService.setStatus(actorId(req), req.params.id, status);
    res.status(200).json(user);
  },

  async setRole(req: Request, res: Response): Promise<void> {
    const { role } = req.body as SetRoleInput;
    const user = await usersService.setRole(actorId(req), req.params.id, role);
    res.status(200).json(user);
  },
};
