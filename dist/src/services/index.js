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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.recordService = exports.userService = exports.authService = void 0;
var auth_service_1 = require("./auth.service");
Object.defineProperty(exports, "authService", { enumerable: true, get: function () { return __importDefault(auth_service_1).default; } });
var user_service_1 = require("./user.service");
Object.defineProperty(exports, "userService", { enumerable: true, get: function () { return __importDefault(user_service_1).default; } });
var record_service_1 = require("./record.service");
Object.defineProperty(exports, "recordService", { enumerable: true, get: function () { return __importDefault(record_service_1).default; } });
var dashboard_service_1 = require("./dashboard.service");
Object.defineProperty(exports, "dashboardService", { enumerable: true, get: function () { return __importDefault(dashboard_service_1).default; } });
__exportStar(require("./auth.service"), exports);
__exportStar(require("./user.service"), exports);
__exportStar(require("./record.service"), exports);
__exportStar(require("./dashboard.service"), exports);
