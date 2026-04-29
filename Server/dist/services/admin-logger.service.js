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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLogger = void 0;
const admin_log_model_1 = require("../models/admin-log.model");
class AdminLogger {
    /**
     * Log an admin action
     */
    static logAction(adminId, action, targetType, targetId, details, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract IP from request if available
                const ipAddress = req
                    ? req.headers["x-forwarded-for"] || req.socket.remoteAddress
                    : "unknown";
                yield admin_log_model_1.AdminLog.create({
                    admin_id: adminId,
                    action,
                    target_type: targetType,
                    target_id: targetId,
                    details,
                    ip_address: ipAddress,
                });
            }
            catch (error) {
                console.error("Failed to write admin log:", error);
                // Non-blocking, don't throw
            }
        });
    }
}
exports.AdminLogger = AdminLogger;
