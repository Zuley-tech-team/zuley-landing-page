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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.handleWebhook = exports.createOrder = void 0;
const paymentService = __importStar(require("./payment.service"));
const env_config_1 = require("../../config/env.config");
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!env_config_1.env.ENABLE_ONLINE_PAYMENTS) {
            return res.status(503).json({
                success: false,
                message: "Online payments are temporarily disabled. Please use Cash on Delivery.",
            });
        }
        const { amount, currency, receipt, notes } = req.body;
        // Basic Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }
        const order = yield paymentService.createPaymentOrder(amount, currency, receipt, notes);
        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: env_config_1.env.RAZORPAY_KEY_ID, // Send key context to frontend
        });
    }
    catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Failed to create payment order" });
    }
});
exports.createOrder = createOrder;
const handleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const signature = req.headers["x-razorpay-signature"];
        // Use rawBody captured by express.json verify option in index.ts
        // We cast req to any because rawBody is not in standard Request type
        const body = req.rawBody;
        if (!body) {
            console.error("Missing raw body for webhook verification");
            return res.status(400).json({ message: "Missing raw body" });
        }
        const isValid = paymentService.verifyWebhookSignature(body, signature);
        if (!isValid) {
            console.warn("Webhook signature verification failed.");
            return res.status(400).json({ message: "Invalid signature" });
        }
        // Process the event using the parsed body
        yield paymentService.processWebhookEvent(req.body);
        res.json({ status: "ok" });
    }
    catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: "Webhook processing failed" });
    }
});
exports.handleWebhook = handleWebhook;
