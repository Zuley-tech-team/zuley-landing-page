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
exports.getSystemLogs = void 0;
const admin_log_model_1 = require("../../models/admin-log.model");
const getSystemLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 50, type, admin_id } = req.query;
        const query = {};
        if (type) {
            query.target_type = type;
        }
        if (admin_id) {
            query.admin_id = admin_id;
        }
        const logs = yield admin_log_model_1.AdminLog.find(query)
            .populate('admin_id', 'name email')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield admin_log_model_1.AdminLog.countDocuments(query);
        res.json({
            success: true,
            data: logs,
            pagination: {
                current: Number(page),
                total: Math.ceil(total / Number(limit)),
                count: total,
            }
        });
    }
    catch (error) {
        console.error("Get Logs Error:", error);
        res.status(500).json({ message: "Failed to fetch logs" });
    }
});
exports.getSystemLogs = getSystemLogs;
