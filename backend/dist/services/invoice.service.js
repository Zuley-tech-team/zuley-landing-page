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
exports.InvoiceService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const invoice_model_1 = require("../models/invoice.model");
const counter_model_1 = require("../models/counter.model");
const SELLER_STATE_CODE = '27'; // Maharashtra
const SELLER_DETAILS = {
    name: 'Zuley',
    gstin: '27XXXXX1234X1Z5', // Replace with env var if needed
    address: '123, Zuley HQ, Mumbai, Maharashtra 400001',
    state: 'Maharashtra',
    stateCode: '27',
    pan: 'XXXXX1234X'
};
const GST_STATE_CODES = {
    "Jammu & Kashmir": "01",
    "Himachal Pradesh": "02",
    "Punjab": "03",
    "Chandigarh": "04",
    "Uttarakhand": "05",
    "Haryana": "06",
    "Delhi": "07",
    "Rajasthan": "08",
    "Uttar Pradesh": "09",
    "Bihar": "10",
    "Sikkim": "11",
    "Arunachal Pradesh": "12",
    "Nagaland": "13",
    "Manipur": "14",
    "Mizoram": "15",
    "Tripura": "16",
    "Meghalaya": "17",
    "Assam": "18",
    "West Bengal": "19",
    "Jharkhand": "20",
    "Odisha": "21",
    "Chhattisgarh": "22",
    "Madhya Pradesh": "23",
    "Gujarat": "24",
    "Dadra & Nagar Haveli and Daman & Diu": "26",
    "Maharashtra": "27",
    "Andhra Pradesh": "37",
    "Karnataka": "29",
    "Goa": "30",
    "Lakshadweep": "31",
    "Kerala": "32",
    "Tamil Nadu": "33",
    "Puducherry": "34",
    "Andaman & Nicobar Islands": "35",
    "Telangana": "36",
    "Ladakh": "38",
    "Other Territory": "97"
};
class InvoiceService {
    /**
     * Helper to get state code from state name
     */
    static getStateCode(stateName) {
        const normalizedState = stateName.trim();
        if (GST_STATE_CODES[normalizedState]) {
            return GST_STATE_CODES[normalizedState];
        }
        const key = Object.keys(GST_STATE_CODES).find(k => k.toLowerCase() === normalizedState.toLowerCase());
        if (key)
            return GST_STATE_CODES[key];
        return '27';
    }
    /**
     * Generates a sequential invoice number in format INV-YYYY-XXXXX
     */
    static generateInvoiceNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth(); // 0-11
            // Determine Financial Year (April to March)
            // If Month is Jan(0), Feb(1), Mar(2), then FY is (Year-1)-(Year)
            // Else FY is (Year)-(Year+1)
            let fyStartYear = currentYear;
            if (currentMonth < 3) {
                fyStartYear = currentYear - 1;
            }
            const fyString = `${fyStartYear}`; // Using just the start year or strict YYYY format
            // We use a specific counter ID for each financial year to reset sequence
            const counterId = `invoice_${fyString}`;
            const counter = yield counter_model_1.Counter.findByIdAndUpdate(counterId, { $inc: { seq: 1 } }, { new: true, upsert: true });
            const sequence = counter.seq.toString().padStart(5, '0');
            return `INV-${fyString}-${sequence}`;
        });
    }
    /**
     * Calculates tax breakup for items based on customer state
     */
    static calculateTax(items, customerStateCode) {
        const isIntraState = customerStateCode === SELLER_STATE_CODE;
        let totalTaxableValue = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;
        let grandTotal = 0;
        const processedItems = items.map(item => {
            // Assuming item.price is the unit price (potentially unrelated to tax, need to clarify if inclusive or exclusive)
            // For this implementation, we assume price is EXCLUSIVE of tax or we calculate tax on top.
            // Let's assume the stored price in Order is the unit price.
            const taxableValue = item.price * item.quantity;
            const gstRate = 0.03; // Fixed 3% for Silver for now
            let cgstAmount = 0;
            let sgstAmount = 0;
            let igstAmount = 0;
            if (isIntraState) {
                cgstAmount = taxableValue * (gstRate / 2);
                sgstAmount = taxableValue * (gstRate / 2);
            }
            else {
                igstAmount = taxableValue * gstRate;
            }
            const itemTotal = taxableValue + cgstAmount + sgstAmount + igstAmount;
            totalTaxableValue += taxableValue;
            totalCGST += cgstAmount;
            totalSGST += sgstAmount;
            totalIGST += igstAmount;
            grandTotal += itemTotal;
            return {
                description: item.name,
                hsnCode: '711311', // Default for Silver Jewellery, should ideally come from Product model
                quantity: item.quantity,
                unitPrice: item.price,
                taxableValue: taxableValue,
                gstRate: gstRate * 100, // Store as percentage (3)
                cgstAmount,
                sgstAmount,
                igstAmount,
                totalAmount: itemTotal
            };
        });
        return {
            processedItems,
            taxSummary: {
                totalTaxableValue,
                totalCGST,
                totalSGST,
                totalIGST
            },
            totalAmount: grandTotal
        };
    }
    /**
     * Generates PDF and saves to disk
     */
    static generatePDF(invoice) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
                const fileName = `${invoice.invoiceNumber}.pdf`;
                // Ensure directory exists
                const dir = path_1.default.join(__dirname, '../../invoices');
                if (!fs_1.default.existsSync(dir)) {
                    fs_1.default.mkdirSync(dir, { recursive: true });
                }
                const filePath = path_1.default.join(dir, fileName);
                const stream = fs_1.default.createWriteStream(filePath);
                doc.pipe(stream);
                // Header
                doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
                doc.moveDown();
                // Seller Details
                doc.fontSize(10).text(`Sold By: ${invoice.sellerDetails.name}`);
                doc.text(invoice.sellerDetails.address);
                doc.text(`GSTIN: ${invoice.sellerDetails.gstin}`);
                doc.text(`State: ${invoice.sellerDetails.state} (${invoice.sellerDetails.stateCode})`);
                doc.moveDown();
                // Buyer Details & Invoice Details (Side by Side roughly)
                const startY = doc.y;
                doc.text(`Bill To: ${invoice.buyerDetails.name}`);
                doc.text(invoice.buyerDetails.billingAddress);
                doc.text(`Phone: ${invoice.buyerDetails.state}`); // Simplified for now
                doc.text(`State Code: ${invoice.buyerDetails.stateCode}`);
                doc.text(`Invoice No: ${invoice.invoiceNumber}`, 300, startY);
                doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 300, startY + 15);
                doc.text(`Order ID: ${invoice.orderId}`, 300, startY + 30);
                doc.moveDown(2);
                // Table Header
                const tableTop = doc.y;
                doc.text('Item', 50, tableTop);
                doc.text('HSN', 200, tableTop);
                doc.text('Qty', 250, tableTop);
                doc.text('Rate', 300, tableTop);
                doc.text('Taxable', 350, tableTop);
                doc.text('Total', 450, tableTop);
                doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
                let position = tableTop + 30;
                // Table Rows
                invoice.items.forEach(item => {
                    doc.text(item.description, 50, position, { width: 140 });
                    doc.text(item.hsnCode, 200, position);
                    doc.text(item.quantity.toString(), 250, position);
                    doc.text(item.unitPrice.toFixed(2), 300, position);
                    doc.text(item.taxableValue.toFixed(2), 350, position);
                    doc.text(item.totalAmount.toFixed(2), 450, position);
                    position += 20;
                });
                doc.moveTo(50, position + 5).lineTo(550, position + 5).stroke();
                // Summary
                position += 20;
                doc.text(`Taxable Value: ${invoice.taxSummary.totalTaxableValue.toFixed(2)}`, 350, position);
                position += 15;
                if (invoice.taxSummary.totalIGST > 0) {
                    doc.text(`IGST: ${invoice.taxSummary.totalIGST.toFixed(2)}`, 350, position);
                    position += 15;
                }
                else {
                    doc.text(`CGST: ${invoice.taxSummary.totalCGST.toFixed(2)}`, 350, position);
                    position += 15;
                    doc.text(`SGST: ${invoice.taxSummary.totalSGST.toFixed(2)}`, 350, position);
                    position += 15;
                }
                doc.fontSize(12).text(`Grand Total: ${invoice.totalAmount.toFixed(2)}`, 350, position + 10);
                // Amount in words (Placeholder)
                doc.fontSize(10).text(`Amount in Words: ${invoice.amountInWords}`, 50, position + 10);
                doc.end();
                stream.on('finish', () => resolve(filePath));
                stream.on('error', (err) => reject(err));
            });
        });
    }
    // TODO: Use a proper library for number to words
    static numberToWords(amount) {
        return `${amount} Rupees Only`; // simplified
    }
    static createInvoice(order, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Generate Invoice Number
            const invoiceNumber = yield this.generateInvoiceNumber();
            // 2. Determine State Code
            const customerState = customer.state || "Maharashtra";
            const customerStateCode = this.getStateCode(customerState);
            // 3. Calculate Tax
            const { processedItems, taxSummary, totalAmount } = this.calculateTax(order.items, customerStateCode);
            // 3. Prepare Invoice Data
            const invoiceData = {
                invoiceNumber,
                orderId: order._id,
                customerId: customer._id,
                invoiceDate: new Date(),
                sellerDetails: SELLER_DETAILS,
                buyerDetails: {
                    name: customer.full_name,
                    billingAddress: `${customer.address_line1}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
                    shippingAddress: `${customer.address_line1}, ${customer.city}, ${customer.state} - ${customer.pincode}`,
                    state: customer.state,
                    stateCode: customerStateCode,
                },
                items: processedItems,
                taxSummary,
                totalAmount,
                amountInWords: this.numberToWords(totalAmount),
                status: 'generated',
                pdfPath: '' // Will update after generation
            };
            // 4. Save to DB (Status: generated)
            const invoice = new invoice_model_1.Invoice(invoiceData);
            // 5. Generate PDF
            const pdfPath = yield this.generatePDF(invoice);
            invoice.pdfPath = pdfPath;
            yield invoice.save();
            return invoice;
        });
    }
}
exports.InvoiceService = InvoiceService;
