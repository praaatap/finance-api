import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import authService from "../services/auth.service";

const setTokensCookie = (res: Response, accessToken: string, refreshToken: string) => {
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
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  setTokensCookie(res, result.accessToken, result.refreshToken);
  res.status(201).json(result);
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  setTokensCookie(res, result.accessToken, result.refreshToken);
  res.json(result);
});

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const rToken = req.cookies.refreshToken || req.body.refreshToken;
  const tokens = await authService.refreshAccessToken(rToken);
  setTokensCookie(res, tokens.accessToken, tokens.refreshToken);
  res.json(tokens);
});

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const rToken = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logout(rToken);
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.cookie("refreshToken", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
});

