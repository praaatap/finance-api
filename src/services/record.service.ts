import prisma from '../utils/prisma';
import redis from '../utils/redis';
import { IRecord, RecordType, IRecordFilters } from '../types';

export class RecordService {
  /**
   * Get records with optional filters
   */
  async getRecords(filters?: IRecordFilters): Promise<IRecord[]> {
    const where: any = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    const records = await prisma.record.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return records as IRecord[];
  }

  /**
   * Get record by ID
   */
  async getRecordById(id: string): Promise<IRecord | null> {
    const record = await prisma.record.findUnique({ where: { id } });
    return record as IRecord | null;
  }

  /**
   * Create a new record
   */
  async createRecord(
    amount: number,
    type: RecordType,
    category: string,
    userId: string,
    date?: Date,
    notes?: string
  ): Promise<IRecord> {
    if (!amount || !type || !category) {
      throw new Error('amount, type, and category are required');
    }

    const record = await prisma.record.create({
      data: {
        amount: parseFloat(amount.toString()),
        type,
        category,
        date: date || new Date(),
        notes,
        userId,
      },
    });

    // Invalidate dashboard cache
    await redis.del('dashboard_summary');

    return record as IRecord;
  }

  /**
   * Update a record
   */
  async updateRecord(
    id: string,
    amount?: number,
    type?: RecordType,
    category?: string,
    date?: Date,
    notes?: string
  ): Promise<IRecord> {
    const existingRecord = await this.getRecordById(id);

    if (!existingRecord) {
      throw new Error('Record not found');
    }

    const record = await prisma.record.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount.toString()) }),
        ...(type && { type }),
        ...(category && { category }),
        ...(date && { date }),
        ...(notes !== undefined && { notes }),
      },
    });

    // Invalidate dashboard cache
    await redis.del('dashboard_summary');

    return record as IRecord;
  }

  /**
   * Delete a record
   */
  async deleteRecord(id: string): Promise<void> {
    const existingRecord = await this.getRecordById(id);

    if (!existingRecord) {
      throw new Error('Record not found');
    }

    await prisma.record.delete({ where: { id } });

    // Invalidate dashboard cache
    await redis.del('dashboard_summary');
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{ totalIncome: number; totalExpenses: number; netBalance: number }> {
    const records = await prisma.record.findMany();

    let totalIncome = 0;
    let totalExpenses = 0;

    records.forEach((record: IRecord) => {
      if (record.type === 'INCOME') {
        totalIncome += record.amount;
      } else {
        totalExpenses += record.amount;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  }
}

export default new RecordService();
