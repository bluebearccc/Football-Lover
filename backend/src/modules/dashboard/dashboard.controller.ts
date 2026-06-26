import type { Request, Response } from 'express';
import type { DateRange } from './dashboard.repository';
import { dashboardService } from './dashboard.service';

function extractRange(req: Request): DateRange | undefined {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  return from || to ? { from, to } : undefined;
}

export const dashboardController = {
  async overview(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as '24h' | '7d') || '24h';
    const range = extractRange(req);

    const [stats, recentLogs, traffic] = await Promise.all([
      dashboardService.stats(range),
      dashboardService.getRecentLogs(),
      dashboardService.getTraffic(period),
    ]);

    res.status(200).json({
      stats,
      recentLogs: recentLogs.items,
      traffic,
    });
  },

  async exportCsv(req: Request, res: Response): Promise<void> {
    const period = (req.query.period as '24h' | '7d') || '24h';
    const range = extractRange(req);

    const csv = await dashboardService.getExportData(range, period);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="dashboard-export-${date}.csv"`);
    res.status(200).send(csv);
  },
};
