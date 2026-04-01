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
exports.logoutUser = exports.refreshToken = exports.authUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const auth_service_1 = __importDefault(require("../services/auth.service"));
const setTokensCookie = (res, accessToken, refreshToken) => {
    res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 Min
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
    });
};
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.default.register(req.body);
    setTokensCookie(res, result.accessToken, result.refreshToken);
    res.status(201).json(result);
}));
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.authUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.default.login(req.body);
    setTokensCookie(res, result.accessToken, result.refreshToken);
    res.json(result);
}));
// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rToken = req.cookies.refreshToken || req.body.refreshToken;
    const tokens = yield auth_service_1.default.refreshAccessToken(rToken);
    setTokensCookie(res, tokens.accessToken, tokens.refreshToken);
    res.json(tokens);
}));
// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rToken = req.cookies.refreshToken || req.body.refreshToken;
    yield auth_service_1.default.logout(rToken);
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: "Logged out successfully" });
}));
