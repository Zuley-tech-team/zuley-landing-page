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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const InvoiceItemSchema = new mongoose_1.Schema({
    description: { type: String, required: true },
    hsnCode: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    taxableValue: { type: Number, required: true },
    gstRate: { type: Number, required: true },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
});
const InvoiceSchema = new mongoose_1.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    invoiceDate: { type: Date, required: true, default: Date.now },
    sellerDetails: {
        name: { type: String, required: true },
        gstin: { type: String, required: true },
        address: { type: String, required: true },
        state: { type: String, required: true },
        stateCode: { type: String, required: true },
        pan: { type: String, required: true },
    },
    buyerDetails: {
        name: { type: String, required: true },
        billingAddress: { type: String, required: true },
        shippingAddress: { type: String, required: true },
        state: { type: String, required: true },
        stateCode: { type: String, required: true },
        gstin: { type: String },
    },
    items: [InvoiceItemSchema],
    taxSummary: {
        totalTaxableValue: { type: Number, required: true },
        totalCGST: { type: Number, default: 0 },
        totalSGST: { type: Number, default: 0 },
        totalIGST: { type: Number, default: 0 },
    },
    totalAmount: { type: Number, required: true },
    amountInWords: { type: String, required: true },
    pdfPath: { type: String, required: true },
    status: { type: String, enum: ['generated', 'emailed', 'void'], default: 'generated' },
}, { timestamps: true });
exports.Invoice = mongoose_1.default.model('Invoice', InvoiceSchema);
