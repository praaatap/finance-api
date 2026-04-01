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
exports.DashboardService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const redis_1 = __importDefault(require("../utils/redis"));
class DashboardService {
    /**
     * Get cached dashboard summary or compute it
     */
    getSummary() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = 'dashboard_summary';
            const cachedData = yield redis_1.default.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            const records = yield prisma_1.default.record.findMany();
            let totalIncome = 0;
            let totalExpenses = 0;
            const categoryTotals = {};
            records.forEach((record) => {
                if (record.type === 'INCOME') {
                    totalIncome += record.amount;
                }
                else if (record.type === 'EXPENSE') {
                    totalExpenses += record.amount;
                    if (!categoryTotals[record.category]) {
                        categoryTotals[record.category] = 0;
                    }
                    categoryTotals[record.category] += record.amount;
                }
            });
            const netBalance = totalIncome - totalExpenses;
            const recentActivity = yield prisma_1.default.record.findMany({
                orderBy: { date: 'desc' },
                take: 5,
                select: { id: true, amount: true, type: true, category: true, date: true }
            });
            const summary = {
                totalIncome,
                totalExpenses,
                netBalance,
                categoryTotals,
                recentActivity: recentActivity,
            };
            yield redis_1.default.set(cacheKey, JSON.stringify(summary), 'EX', 3600); // Cache for 1 hour
            return summary;
        });
    }
}
exports.DashboardService = DashboardService;
exports.default = new DashboardService();
