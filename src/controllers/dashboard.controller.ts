import { Response } from "express";
import asyncHandler from "express-async-handler";
import dashboardService from "../services/dashboard.service";
import { AuthRequest } from "../middlewares/auth.middleware";

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private (All roles)
export const getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = await dashboardService.getSummary();
  res.json(summary);
});

