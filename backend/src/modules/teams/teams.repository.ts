import type { Player, Prisma, Team } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export const teamsRepository = {
  list(params: {
    where: Prisma.TeamWhereInput;
    skip: number;
    take: number;
  }): Promise<[Team[], number]> {
    return Promise.all([
      prisma.team.findMany({
        where: params.where,
        orderBy: { name: 'asc' },
        skip: params.skip,
        take: params.take,
        include: { _count: { select: { players: true } } },
      }),
      prisma.team.count({ where: params.where }),
    ]);
  },

  findById(id: string): Promise<Team | null> {
    return prisma.team.findUnique({ where: { id } });
  },

  findByIdWithPlayers(id: string) {
    return prisma.team.findUnique({ where: { id }, include: { players: true } });
  },

  findByExternalId(externalId: string): Promise<Team | null> {
    return prisma.team.findUnique({ where: { externalId } });
  },

  create(data: Prisma.TeamCreateInput): Promise<Team> {
    return prisma.team.create({ data });
  },

  update(id: string, data: Prisma.TeamUpdateInput): Promise<Team> {
    return prisma.team.update({ where: { id }, data });
  },

  /** A team is referenced if it is home or away of any match (BR23 / AC-13-02). */
  async isReferencedByMatch(id: string): Promise<boolean> {
    const count = await prisma.match.count({
      where: { OR: [{ homeTeamId: id }, { awayTeamId: id }] },
    });
    return count > 0;
  },

  async delete(id: string): Promise<void> {
    await prisma.team.delete({ where: { id } });
  },

  // Players
  createPlayer(data: Prisma.PlayerCreateInput): Promise<Player> {
    return prisma.player.create({ data });
  },

  findPlayerById(id: string): Promise<Player | null> {
    return prisma.player.findUnique({ where: { id } });
  },

  updatePlayer(id: string, data: Prisma.PlayerUpdateInput): Promise<Player> {
    return prisma.player.update({ where: { id }, data });
  },

  async deletePlayer(id: string): Promise<void> {
    await prisma.player.delete({ where: { id } });
  },
};
