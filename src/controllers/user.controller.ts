import { Response } from "express";
import asyncHandler from "express-async-handler";
import userService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middleware";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(users);
});

// @desc    Update user role/status
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role, status } = req.body;
  const { id } = req.params as Record<string, string>;
  const updatedUser = await userService.updateUser(id, role, status);
  res.json(updatedUser);
});

