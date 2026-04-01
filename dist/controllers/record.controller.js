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
exports.deleteRecord = exports.updateRecord = exports.createRecord = exports.getRecords = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const record_service_1 = __importDefault(require("../services/record.service"));
// @desc    Get financial records (with filters)
// @route   GET /api/records
// @access  Private (Admin, Analyst)
exports.getRecords = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, category, startDate, endDate } = req.query;
    const filters = {};
    if (type)
        filters.type = type;
    if (category)
        filters.category = category;
    if (startDate)
        filters.startDate = new Date(startDate);
    if (endDate)
        filters.endDate = new Date(endDate);
    const records = yield record_service_1.default.getRecords(filters);
    res.json(records);
}));
// @desc    Create a record
// @route   POST /api/records
// @access  Private (Admin)
exports.createRecord = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, type, category, date, notes } = req.body;
    const record = yield record_service_1.default.createRecord(amount, type, category, req.user.id, date ? new Date(date) : undefined, notes);
    res.status(201).json(record);
}));
// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Private (Admin)
exports.updateRecord = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;
    const record = yield record_service_1.default.updateRecord(id, amount, type, category, date ? new Date(date) : undefined, notes);
    res.json(record);
}));
// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private (Admin)
exports.deleteRecord = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield record_service_1.default.deleteRecord(id);
    res.json({ message: "Record removed successfully" });
}));
