import type { CreateAdminLogData, AdminLogQuery } from './admin-log.repository';
import { adminLogRepository } from './admin-log.repository';

const RETENTION_DAYS = 90;
const CLEANUP_PROBABILITY = 0.01;

export const adminLogService = {
  async logAction(adminId: string, data: Omit<CreateAdminLogData, 'adminId'>) {
    const result = await adminLogRepository.create({ adminId, ...data });
    if (Math.random() < CLEANUP_PROBABILITY) {
      adminLogRepository.deleteOlderThan(RETENTION_DAYS).catch(() => {});
    }
    return result;
  },

  async getLogs(query: AdminLogQuery) {
    return adminLogRepository.findMany(query);
  },
};
