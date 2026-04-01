import prisma from '../utils/prisma';
import redis from '../utils/redis';
import { IDashboardSummary, IRecord } from '../types';

export class DashboardService {
  /**
   * Get cached dashboard summary or compute it
   */
  async getSummary(): Promise<IDashboardSummary> {
    const cacheKey = 'dashboard_summary';
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const records = await prisma.record.findMany();

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals: Record<string, number> = {};

    records.forEach((record: IRecord) => {
      if (record.type === 'INCOME') {
        totalIncome += record.amount;
      } else if (record.type === 'EXPENSE') {
        totalExpenses += record.amount;

        if (!categoryTotals[record.category]) {
          categoryTotals[record.category] = 0;
        }
        categoryTotals[record.category] += record.amount;
      }
    });

    const netBalance = totalIncome - totalExpenses;

    const recentActivity = await prisma.record.findMany({
      orderBy: { date: 'desc' },
      take: 5,
      select: { id: true, amount: true, type: true, category: true, date: true }
    });

    const summary: IDashboardSummary = {
      totalIncome,
      totalExpenses,
      netBalance,
      categoryTotals,
      recentActivity: recentActivity as any,
    };

    await redis.set(cacheKey, JSON.stringify(summary), 'EX', 3600); // Cache for 1 hour

    return summary;
  }
}

export default new DashboardService();
