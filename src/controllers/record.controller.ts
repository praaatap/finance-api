import { Response } from "express";
import asyncHandler from "express-async-handler";
import recordService from "../services/record.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { RecordType } from "../types";

// @desc    Get financial records (with filters)
// @route   GET /api/records
// @access  Private (Admin, Analyst)
export const getRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, category, startDate, endDate } = req.query;

  const filters: any = {};
  if (type) filters.type = type as RecordType;
  if (category) filters.category = category;
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);

  const records = await recordService.getRecords(filters);
  res.json(records);
});

// @desc    Create a record
// @route   POST /api/records
// @access  Private (Admin)
export const createRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, type, category, date, notes } = req.body;

  const record = await recordService.createRecord(
    amount,
    type,
    category,
    req.user!.id,
    date ? new Date(date) : undefined,
    notes
  );

  res.status(201).json(record);
});

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Private (Admin)
export const updateRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as Record<string, string>;
  const { amount, type, category, date, notes } = req.body;

  const record = await recordService.updateRecord(
    id,
    amount,
    type,
    category,
    date ? new Date(date) : undefined,
    notes
  );

  res.json(record);
});

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private (Admin)
export const deleteRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as Record<string, string>;

  await recordService.deleteRecord(id);

  res.json({ message: "Record removed successfully" });
});

