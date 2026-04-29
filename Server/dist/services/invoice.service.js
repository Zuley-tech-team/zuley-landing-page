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
const env_config_1 = require("../config/env.config");
const SELLER_STATE_CODE = env_config_1.env.INVOICE_SELLER_STATE_CODE;
const SELLER_DETAILS = {
    name: env_config_1.env.INVOICE_SELLER_NAME,
    gstin: env_config_1.env.INVOICE_SELLER_GSTIN,
    address: env_config_1.env.INVOICE_SELLER_ADDRESS,
    state: env_config_1.env.INVOICE_SELLER_STATE,
    stateCode: env_config_1.env.INVOICE_SELLER_STATE_CODE,
    pan: env_config_1.env.INVOICE_SELLER_PAN,
};
const formatInvoiceMoney = (amount) => new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(amount);
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
            const gstRate = 0.03; // Fixed 3% for silver products.
            const grossUnitPrice = Number(item.price || 0) / 100;
            const grossItemTotal = grossUnitPrice * item.quantity;
            const taxableValue = grossItemTotal / (1 + gstRate);
            const totalTax = grossItemTotal - taxableValue;
            let cgstAmount = 0;
            let sgstAmount = 0;
            let igstAmount = 0;
            if (isIntraState) {
                cgstAmount = totalTax / 2;
                sgstAmount = totalTax / 2;
            }
            else {
                igstAmount = totalTax;
            }
            const itemTotal = grossItemTotal;
            totalTaxableValue += taxableValue;
            totalCGST += cgstAmount;
            totalSGST += sgstAmount;
            totalIGST += igstAmount;
            grandTotal += itemTotal;
            return {
                description: item.name,
                hsnCode: '711311', // Default for Silver Jewellery, should ideally come from Product model
                quantity: item.quantity,
                unitPrice: grossUnitPrice,
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
    static generatePDF(invoice_1) {
        return __awaiter(this, arguments, void 0, function* (invoice, paymentMethod = 'online', orderNumber) {
            return new Promise((resolve, reject) => {
                const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
                const isCod = paymentMethod === 'cod';
                const fileName = `${invoice.invoiceNumber}.pdf`;
                // Ensure directory exists
                const dir = path_1.default.join(__dirname, '../../invoices');
                if (!fs_1.default.existsSync(dir)) {
                    fs_1.default.mkdirSync(dir, { recursive: true });
                }
                const filePath = path_1.default.join(dir, fileName);
                const stream = fs_1.default.createWriteStream(filePath);
                doc.pipe(stream);
                doc.rect(0, 0, 595.28, 112).fillColor('#1C1C1E').fill();
                doc.font('Helvetica-Bold').fontSize(28).fillColor('#FFFFFF').text('ZULEY', 50, 34);
                doc.font('Helvetica').fontSize(9).fillColor('#D7D2CB').text('Premium Silver Crafted for You', 50, 67);
                doc.font('Helvetica-Bold').fontSize(18).fillColor('#FFFFFF').text('TAX INVOICE', 360, 34, { width: 185, align: 'right' });
                doc.font('Helvetica').fontSize(9).fillColor('#D7D2CB').text(`Invoice No: ${invoice.invoiceNumber}`, 360, 62, { width: 185, align: 'right' });
                doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`, 360, 78, { width: 185, align: 'right' });
                if (isCod) {
                    doc.roundedRect(50, 126, 495, 32, 6).fillColor('#FFF7ED').fill();
                    doc.font('Helvetica-Bold').fontSize(10).fillColor('#B45309').text('PAYMENT ON DELIVERY', 64, 137);
                    doc.font('Helvetica').fontSize(9).fillColor('#92400E').text('Cash on Delivery order. Amount is payable when the shipment is delivered.', 208, 137);
                }
                doc.y = isCod ? 182 : 132;
                // Seller Details
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#1A1A1A').text('Sold By', 50, doc.y);
                doc.font('Helvetica').fontSize(9).fillColor('#333333');
                doc.text(invoice.sellerDetails.name);
                doc.text(invoice.sellerDetails.address, { width: 230 });
                doc.text(`PAN: ${invoice.sellerDetails.pan}`);
                doc.text(`State: ${invoice.sellerDetails.state} (${invoice.sellerDetails.stateCode})`);
                // Buyer Details & Invoice Details
                const startY = isCod ? 182 : 132;
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#1A1A1A').text('Bill To', 330, startY);
                doc.font('Helvetica').fontSize(9).fillColor('#333333');
                doc.text(invoice.buyerDetails.name, 330, startY + 15);
                doc.text(invoice.buyerDetails.billingAddress, 330, startY + 30, { width: 210 });
                doc.text(`State: ${invoice.buyerDetails.state}`, 330, doc.y);
                doc.text(`State Code: ${invoice.buyerDetails.stateCode}`, 330, doc.y);
                doc.moveDown(0.8);
                doc.font('Helvetica-Bold').fillColor('#1A1A1A').text('Order Details', 330, doc.y);
                doc.font('Helvetica').fillColor('#333333');
                doc.text(`Order ID: ${orderNumber || invoice.orderId}`);
                doc.text(`Payment: ${isCod ? 'Payment on Delivery (COD)' : 'Paid Online'}`);
                doc.y = Math.max(doc.y, isCod ? 292 : 242);
                // Table Header Background
                const tableTop = doc.y;
                doc.rect(50, tableTop - 5, 500, 20).fillColor('#F3F4F6').fill();
                doc.font('Helvetica-Bold').fillColor('#1A1A1A').fontSize(9);
                doc.text('Item', 60, tableTop);
                doc.text('HSN', 210, tableTop);
                doc.text('Qty', 260, tableTop);
                doc.text('Rate', 310, tableTop);
                doc.text('Taxable', 380, tableTop);
                doc.text('Total', 480, tableTop);
                let position = tableTop + 25;
                // Table Rows
                doc.font('Helvetica').fillColor('#333333').fontSize(9);
                invoice.items.forEach(item => {
                    doc.text(item.description, 60, position, { width: 140 });
                    doc.text(item.hsnCode, 210, position);
                    doc.text(item.quantity.toString(), 260, position);
                    doc.text(formatInvoiceMoney(item.unitPrice), 310, position);
                    doc.text(formatInvoiceMoney(item.taxableValue), 380, position);
                    doc.text(formatInvoiceMoney(item.totalAmount), 480, position);
                    position += 25;
                });
                doc.moveTo(50, position + 5).lineTo(550, position + 5).strokeColor('#E5E7EB').stroke();
                // Summary
                position += 20;
                doc.font('Helvetica').fontSize(9);
                doc.text(`Taxable Value:`, 350, position);
                doc.text(`${formatInvoiceMoney(invoice.taxSummary.totalTaxableValue)}`, 480, position);
                position += 15;
                if (invoice.taxSummary.totalIGST > 0) {
                    doc.text(`IGST:`, 350, position);
                    doc.text(`${formatInvoiceMoney(invoice.taxSummary.totalIGST)}`, 480, position);
                    position += 15;
                }
                else {
                    doc.text(`CGST:`, 350, position);
                    doc.text(`${formatInvoiceMoney(invoice.taxSummary.totalCGST)}`, 480, position);
                    position += 15;
                    doc.text(`SGST:`, 350, position);
                    doc.text(`${formatInvoiceMoney(invoice.taxSummary.totalSGST)}`, 480, position);
                    position += 15;
                }
                doc.moveTo(350, position + 5).lineTo(550, position + 5).strokeColor('#E5E7EB').stroke();
                position += 15;
                doc.font('Helvetica-Bold').fontSize(11).fillColor('#1A1A1A');
                doc.text(`Grand Total:`, 350, position);
                doc.text(`INR ${formatInvoiceMoney(invoice.totalAmount)}`, 480, position);
                if (isCod) {
                    position += 18;
                    doc.font('Helvetica-Bold').fontSize(9).fillColor('#B45309');
                    doc.text("");
                }
                const footerStartY = Math.max(position + 30, doc.y + 26);
                doc.font('Helvetica-Bold').fontSize(9).fillColor('#1A1A1A').text('Amount in Words:', 50, footerStartY);
                doc.font('Helvetica').fontSize(9).fillColor('#333333').text(invoice.amountInWords, 50, footerStartY + 14, { width: 500 });
                const signatureY = footerStartY + 48;
                doc.font('Helvetica-Oblique').fontSize(8).fillColor('#9CA3AF')
                    .text('This is a computer generated invoice and does not require a physical signature.', 50, signatureY, { width: 500, align: 'center' });
                doc.end();
                stream.on('finish', () => resolve(filePath));
                stream.on('error', (err) => reject(err));
            });
        });
    }
    static convertSubThousandToWords(value) {
        const ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        let words = '';
        const hundred = Math.floor(value / 100);
        const remainder = value % 100;
        if (hundred > 0) {
            words += `${ones[hundred]} Hundred`;
            if (remainder > 0) {
                words += ' ';
            }
        }
        if (remainder > 0) {
            if (remainder < 20) {
                words += ones[remainder];
            }
            else {
                const ten = Math.floor(remainder / 10);
                const one = remainder % 10;
                words += tens[ten];
                if (one > 0) {
                    words += ` ${ones[one]}`;
                }
            }
        }
        return words.trim();
    }
    static convertNumberToIndianWords(value) {
        if (value === 0) {
            return 'Zero';
        }
        if (value < 0) {
            return `Minus ${this.convertNumberToIndianWords(Math.abs(value))}`;
        }
        const crore = Math.floor(value / 10000000);
        const lakh = Math.floor((value % 10000000) / 100000);
        const thousand = Math.floor((value % 100000) / 1000);
        const hundredAndBelow = value % 1000;
        const chunks = [];
        if (crore > 0) {
            chunks.push(`${this.convertSubThousandToWords(crore)} Crore`);
        }
        if (lakh > 0) {
            chunks.push(`${this.convertSubThousandToWords(lakh)} Lakh`);
        }
        if (thousand > 0) {
            chunks.push(`${this.convertSubThousandToWords(thousand)} Thousand`);
        }
        if (hundredAndBelow > 0) {
            chunks.push(this.convertSubThousandToWords(hundredAndBelow));
        }
        return chunks.join(' ').trim();
    }
    static numberToWords(amount) {
        const rounded = Number(amount.toFixed(2));
        const rupees = Math.floor(rounded);
        const paise = Math.round((rounded - rupees) * 100);
        const rupeesInWords = this.convertNumberToIndianWords(rupees);
        if (paise > 0) {
            const paiseInWords = this.convertNumberToIndianWords(paise);
            return `${rupeesInWords} Rupees and ${paiseInWords} Paise Only`;
        }
        return `${rupeesInWords} Rupees Only`;
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
            const pdfPath = yield this.generatePDF(invoice, order.payment_method, order.order_id);
            invoice.pdfPath = pdfPath;
            yield invoice.save();
            return invoice;
        });
    }
}
exports.InvoiceService = InvoiceService;
