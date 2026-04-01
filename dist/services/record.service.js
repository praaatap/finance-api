"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const redis_1 = __importDefault(require("../utils/redis"));
class RecordService {
    /**
     * Get records with optional filters
     */
    getRecords(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (filters === null || filters === void 0 ? void 0 : filters.type)
                where.type = filters.type;
            if (filters === null || filters === void 0 ? void 0 : filters.category)
                where.category = filters.category;
            if ((filters === null || filters === void 0 ? void 0 : filters.startDate) || (filters === null || filters === void 0 ? void 0 : filters.endDate)) {
                where.date = {};
                if (filters.startDate)
                    where.date.gte = filters.startDate;
                if (filters.endDate)
                    where.date.lte = filters.endDate;
            }
            const records = yield prisma_1.default.record.findMany({
                where,
                orderBy: { date: 'desc' },
            });
            return records;
        });
    }
    /**
     * Get record by ID
     */
    getRecordById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield prisma_1.default.record.findUnique({ where: { id } });
            return record;
        });
    }
    /**
     * Create a new record
     */
    createRecord(amount, type, category, userId, date, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!amount || !type || !category) {
                throw new Error('amount, type, and category are required');
            }
            const record = yield prisma_1.default.record.create({
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
            yield redis_1.default.del('dashboard_summary');
            return record;
        });
    }
    /**
     * Update a record
     */
    updateRecord(id, amount, type, category, date, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingRecord = yield this.getRecordById(id);
            if (!existingRecord) {
                throw new Error('Record not found');
            }
            const record = yield prisma_1.default.record.update({
                where: { id },
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (amount && { amount: parseFloat(amount.toString()) })), (type && { type })), (category && { category })), (date && { date })), (notes !== undefined && { notes })),
            });
            // Invalidate dashboard cache
            yield redis_1.default.del('dashboard_summary');
            return record;
        });
    }
    /**
     * Delete a record
     */
    deleteRecord(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingRecord = yield this.getRecordById(id);
            if (!existingRecord) {
                throw new Error('Record not found');
            }
            yield prisma_1.default.record.delete({ where: { id } });
            // Invalidate dashboard cache
            yield redis_1.default.del('dashboard_summary');
        });
    }
    /**
     * Get statistics
     */
    getStatistics() {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield prisma_1.default.record.findMany();
            let totalIncome = 0;
            let totalExpenses = 0;
            records.forEach((record) => {
                if (record.type === 'INCOME') {
                    totalIncome += record.amount;
                }
                else {
                    totalExpenses += record.amount;
                }
            });
            return {
                totalIncome,
                totalExpenses,
                netBalance: totalIncome - totalExpenses,
            };
        });
    }
}
exports.RecordService = RecordService;
exports.default = new RecordService();
