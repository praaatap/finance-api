"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = global.prisma || new client_1.PrismaClient({ adapter: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production')
    global.prisma = prisma;
exports.default = prisma;
