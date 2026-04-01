"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AuthService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = __importStar(require("../utils/jwt"));
const redis_1 = __importDefault(require("../utils/redis"));
class AuthService {
    /**
     * Register a new user
     */
    register(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = payload;
            const userExists = yield prisma_1.default.user.findUnique({
                where: { email },
            });
            if (userExists) {
                throw new Error('User already exists');
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            const user = yield prisma_1.default.user.create({
                data: {
                    email,
                    password: hashedPassword,
                },
            });
            const { accessToken, refreshToken } = (0, jwt_1.default)(user.id, user.role);
            yield (0, jwt_1.storeRefreshToken)(user.id, refreshToken);
            return {
                _id: user.id,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken,
            };
        });
    }
    /**
     * Login user
     */
    login(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = payload;
            const user = yield prisma_1.default.user.findUnique({ where: { email } });
            if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
                throw new Error('Invalid email or password');
            }
            if (user.status === 'INACTIVE') {
                throw new Error('User is inactive, contact admin.');
            }
            const { accessToken, refreshToken } = (0, jwt_1.default)(user.id, user.role);
            yield (0, jwt_1.storeRefreshToken)(user.id, refreshToken);
            return {
                _id: user.id,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken,
            };
        });
    }
    /**
     * Refresh tokens using refresh token
     */
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken) {
                throw new Error('No refresh token provided');
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET || 'refreshsecret');
            const redisToken = yield redis_1.default.get(`refresh_token:${decoded.id}`);
            if (redisToken !== refreshToken) {
                throw new Error('Invalid refresh token');
            }
            const user = yield prisma_1.default.user.findUnique({ where: { id: decoded.id } });
            if (!user || user.status === 'INACTIVE') {
                throw new Error('User invalid or inactive');
            }
            const { accessToken, refreshToken: newRefreshToken } = (0, jwt_1.default)(user.id, user.role);
            yield (0, jwt_1.storeRefreshToken)(user.id, newRefreshToken);
            return { accessToken, refreshToken: newRefreshToken };
        });
    }
    /**
     * Logout user - invalidate refresh token
     */
    logout(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (refreshToken) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET || 'refreshsecret');
                    yield (0, jwt_1.deleteRefreshToken)(decoded.id);
                }
                catch (e) {
                    // Silent fail if token is invalid
                }
            }
        });
    }
    /**
     * Verify access token
     */
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        }
        catch (error) {
            throw new Error('Invalid access token');
        }
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
