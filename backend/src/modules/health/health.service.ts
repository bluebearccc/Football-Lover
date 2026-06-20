import { prisma } from '../../lib/prisma';

export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
  database: 'up' | 'down';
  timestamp: string;
}

export const healthService = {
  async check(): Promise<HealthStatus> {
    let database: 'up' | 'down' = 'down';
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      database = 'down';
    }
    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      database,
      timestamp: new Date().toISOString(),
    };
  },
};
