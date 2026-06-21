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

  findActiveByName(name: string, excludeId?: string): Promise<Team | null> {
    return prisma.team.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        isActive: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
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

  async upsertByExternalId(data: {
    externalId: string;
    name: string;
    shortName: string | null;
    logoUrl: string | null;
  }): Promise<{ team: Team; created: boolean; changed: boolean }> {
    const existing = await prisma.team.findUnique({
      where: { externalId: data.externalId },
    });
    if (existing) {
      const changed = existing.logoUrl !== data.logoUrl;
      if (changed) {
        const team = await prisma.team.update({
          where: { id: existing.id },
          data: { logoUrl: data.logoUrl },
        });
        return { team, created: false, changed: true };
      }
      return { team: existing, created: false, changed: false };
    }
    const team = await prisma.team.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        logoUrl: data.logoUrl,
        externalId: data.externalId,
      },
    });
    return { team, created: true, changed: true };
  },

  async upsertPlayerByExternalId(data: {
    externalId: string;
    teamId: string;
    name: string;
    position: string | null;
    imageUrl: string | null;
  }): Promise<{ created: boolean; changed: boolean }> {
    const existing = await prisma.player.findUnique({
      where: { externalId: data.externalId },
    });
    if (existing) {
      const changed =
        existing.name !== data.name ||
        existing.position !== data.position ||
        existing.imageUrl !== data.imageUrl ||
        existing.teamId !== data.teamId;
      if (changed) {
        await prisma.player.update({
          where: { id: existing.id },
          data: {
            name: data.name,
            position: data.position,
            imageUrl: data.imageUrl,
            teamId: data.teamId,
          },
        });
        return { created: false, changed: true };
      }
      return { created: false, changed: false };
    }
    await prisma.player.create({
      data: {
        name: data.name,
        position: data.position,
        imageUrl: data.imageUrl,
        externalId: data.externalId,
        team: { connect: { id: data.teamId } },
      },
    });
    return { created: true, changed: true };
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
