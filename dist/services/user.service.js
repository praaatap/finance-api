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
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class UserService {
    /**
     * Get all users
     */
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield prisma_1.default.user.findMany({
                select: { id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
            });
            return users;
        });
    }
    /**
     * Get user by ID
     */
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({
                where: { id },
                select: { id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
            });
            return user;
        });
    }
    /**
     * Update user role and status
     */
    updateUser(id, role, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.default.user.findUnique({ where: { id } });
            if (!user) {
                throw new Error("User not found");
            }
            const updatedUser = yield prisma_1.default.user.update({
                where: { id },
                data: Object.assign(Object.assign({}, (role && { role })), (status && { status })),
                select: { id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
            });
            return updatedUser;
        });
    }
    /**
     * Deactivate user
     */
    deactivateUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateUser(id, undefined, "INACTIVE");
        });
    }
    /**
     * Activate user
     */
    activateUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateUser(id, undefined, "ACTIVE");
        });
    }
}
exports.UserService = UserService;
exports.default = new UserService();
