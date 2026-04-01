"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecordSchema = exports.createRecordSchema = exports.updateUserSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
        status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    })
});
exports.createRecordSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        type: zod_1.z.enum(['INCOME', 'EXPENSE']),
        category: zod_1.z.string().min(1),
        date: zod_1.z.string().datetime().optional(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.updateRecordSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive().optional(),
        type: zod_1.z.enum(['INCOME', 'EXPENSE']).optional(),
        category: zod_1.z.string().min(1).optional(),
        date: zod_1.z.string().datetime().optional(),
        notes: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid(),
    })
});
