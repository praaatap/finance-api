"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const record_controller_1 = require("../controllers/record.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const schemas_1 = require("../utils/schemas");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get financial records
 *     description: Retrieve financial records with optional filtering
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *   post:
 *     summary: Create a financial record
 *     description: Create a new income or expense record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category]
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 */
router.route('/')
    .get(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('ADMIN', 'ANALYST'), record_controller_1.getRecords)
    .post(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(schemas_1.createRecordSchema), record_controller_1.createRecord);
/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update a record
 *     description: Update an existing financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *   delete:
 *     summary: Delete a record
 *     description: Delete a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       404:
 *         description: Record not found
 */
router.route('/:id')
    .put(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('ADMIN'), (0, validate_middleware_1.validate)(schemas_1.updateRecordSchema), record_controller_1.updateRecord)
    .delete(auth_middleware_1.protect, (0, auth_middleware_1.authorize)('ADMIN'), record_controller_1.deleteRecord);
exports.default = router;
