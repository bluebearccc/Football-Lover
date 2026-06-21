import type { Player, Prisma, Team } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { teamsRepository } from './teams.repository';
import type {
  CreatePlayerInput,
  CreateTeamInput,
  ListTeamsQuery,
  UpdatePlayerInput,
  UpdateTeamInput,
} from './teams.dto';

async function ensureTeam(id: string): Promise<Team> {
  const team = await teamsRepository.findById(id);
  if (!team) throw ApiError.notFound('Không tìm thấy đội bóng');
  return team;
}

export const teamsService = {
  async list(query: ListTeamsQuery) {
    const where: Prisma.TeamWhereInput = {};
    if (query.active) where.isActive = query.active === 'true';
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    const [teams, total] = await teamsRepository.list({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return { items: teams, total, page: query.page, pageSize: query.pageSize };
  },

  getById(id: string) {
    return teamsRepository
      .findByIdWithPlayers(id)
      .then((t) => t ?? Promise.reject(ApiError.notFound('Không tìm thấy đội bóng')));
  },

  async create(input: CreateTeamInput): Promise<Team> {
    const nameDup = await teamsRepository.findActiveByName(input.name);
    if (nameDup) throw ApiError.conflict('Tên đội đã tồn tại');
    if (input.externalId) {
      const dup = await teamsRepository.findByExternalId(input.externalId);
      if (dup) throw ApiError.conflict('external_id đã tồn tại');
    }
    return teamsRepository.create({
      name: input.name,
      shortName: input.shortName,
      logoUrl: input.logoUrl,
      externalId: input.externalId,
    });
  },

  async update(id: string, input: UpdateTeamInput): Promise<Team> {
    await ensureTeam(id);
    if (input.name) {
      const nameDup = await teamsRepository.findActiveByName(input.name, id);
      if (nameDup) throw ApiError.conflict('Tên đội đã tồn tại');
    }
    return teamsRepository.update(id, {
      name: input.name,
      shortName: input.shortName,
      logoUrl: input.logoUrl,
      externalId: input.externalId,
      isActive: input.isActive,
    });
  },

  /** AC-13-02: hard delete only when not referenced; otherwise deactivate. */
  async remove(id: string): Promise<{ deleted: boolean; team?: Team }> {
    await ensureTeam(id);
    if (await teamsRepository.isReferencedByMatch(id)) {
      const team = await teamsRepository.update(id, { isActive: false });
      return { deleted: false, team };
    }
    await teamsRepository.delete(id);
    return { deleted: true };
  },

  async setActive(id: string, isActive: boolean): Promise<Team> {
    await ensureTeam(id);
    return teamsRepository.update(id, { isActive });
  },

  // Players
  async addPlayer(teamId: string, input: CreatePlayerInput): Promise<Player> {
    await ensureTeam(teamId);
    return teamsRepository.createPlayer({
      name: input.name,
      position: input.position,
      imageUrl: input.imageUrl,
      externalId: input.externalId,
      team: { connect: { id: teamId } },
    });
  },

  async updatePlayer(playerId: string, input: UpdatePlayerInput): Promise<Player> {
    const player = await teamsRepository.findPlayerById(playerId);
    if (!player) throw ApiError.notFound('Không tìm thấy cầu thủ');
    return teamsRepository.updatePlayer(playerId, {
      name: input.name,
      position: input.position,
      imageUrl: input.imageUrl,
      externalId: input.externalId,
    });
  },

  async removePlayer(playerId: string): Promise<void> {
    const player = await teamsRepository.findPlayerById(playerId);
    if (!player) throw ApiError.notFound('Không tìm thấy cầu thủ');
    await teamsRepository.deletePlayer(playerId);
  },
};
