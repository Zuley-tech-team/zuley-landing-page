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
exports.generateOrderId = void 0;
const order_model_1 = require("../models/order.model");
/**
 * Generates a human-readable Order ID in the format: ZUL-YYMMDD-XXXX
 * ZUL: Brand Prefix
 * YYMMDD: Date string (e.g. 250213 for Feb 13, 2025)
 * XXXX: Sequential number for that day (0001, 0002...)
 */
const generateOrderId = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    // Format date as YYMMDD
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;
    const prefix = `ZUL-${dateStr}-`;
    // Find the last order created today (using regex to match prefix)
    const lastOrder = yield order_model_1.Order.findOne({
        order_id: { $regex: `^${prefix}` }
    })
        .sort({ order_id: -1 }) // Get the latest one
        .select("order_id");
    let sequence = 1;
    if (lastOrder && lastOrder.order_id) {
        const parts = lastOrder.order_id.split("-");
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
            sequence = lastSeq + 1;
        }
    }
    // Pad sequence to 4 digits
    const sequenceStr = String(sequence).padStart(4, "0");
    return `${prefix}${sequenceStr}`;
});
exports.generateOrderId = generateOrderId;
