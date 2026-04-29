import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Invoice, IInvoice, IInvoiceItem } from '../models/invoice.model';
import { Counter } from '../models/counter.model';
import { IOrder } from '../models/order.model';
import { ICustomer } from '../models/customer.model';
import { env } from '../config/env.config';

const SELLER_STATE_CODE = env.INVOICE_SELLER_STATE_CODE;
const SELLER_DETAILS = {
    name: env.INVOICE_SELLER_NAME,
    gstin: env.INVOICE_SELLER_GSTIN,
    address: env.INVOICE_SELLER_ADDRESS,
    state: env.INVOICE_SELLER_STATE,
    stateCode: env.INVOICE_SELLER_STATE_CODE,
    pan: env.INVOICE_SELLER_PAN,
};

const GST_STATE_CODES: { [key: string]: string } = {
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

export class InvoiceService {

    /**
     * Helper to get state code from state name
     */
    private static getStateCode(stateName: string): string {
        const normalizedState = stateName.trim();
        if (GST_STATE_CODES[normalizedState]) {
            return GST_STATE_CODES[normalizedState];
        }
        const key = Object.keys(GST_STATE_CODES).find(k => k.toLowerCase() === normalizedState.toLowerCase());
        if (key) return GST_STATE_CODES[key];
        return '27';
    }

    /**
     * Generates a sequential invoice number in format INV-YYYY-XXXXX
     */
    private static async generateInvoiceNumber(): Promise<string> {
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

        const counter = await Counter.findByIdAndUpdate(
            counterId,
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const sequence = counter.seq.toString().padStart(5, '0');
        return `INV-${fyString}-${sequence}`;
    }

    /**
     * Calculates tax breakup for items based on customer state
     */
    private static calculateTax(items: any[], customerStateCode: string): {
        processedItems: IInvoiceItem[],
        taxSummary: any,
        totalAmount: number
    } {
        const isIntraState = customerStateCode === SELLER_STATE_CODE;

        let totalTaxableValue = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;
        let grandTotal = 0;

        const processedItems: IInvoiceItem[] = items.map(item => {
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
            } else {
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
    private static async generatePDF(invoice: IInvoice, paymentMethod: string = 'online'): Promise<string> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const fileName = `${invoice.invoiceNumber}.pdf`;
            // Ensure directory exists
            const dir = path.join(__dirname, '../../invoices');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const filePath = path.join(dir, fileName);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Modern Header
            doc.font('Helvetica-Bold').fontSize(28).fillColor('#1A1A1A').text('ZULEY', { align: 'left' });
            doc.fontSize(10).fillColor('#666666').text('Premium Silver Crafted for You', { align: 'left' });
            doc.moveDown(1);
            
            doc.font('Helvetica-Bold').fontSize(16).fillColor('#1A1A1A').text('TAX INVOICE', { align: 'center' });
            
            if (paymentMethod === 'cod') {
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#D97706').text('PAYMENT DUE (CASH ON DELIVERY)', { align: 'center' });
            }
            doc.moveDown(2);

            // Seller Details
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#1A1A1A').text('Sold By:', 50, doc.y);
            doc.font('Helvetica').fillColor('#333333');
            doc.text(invoice.sellerDetails.name);
            doc.text(invoice.sellerDetails.address);
            
            if (paymentMethod !== 'cod') {
                doc.text(`GSTIN: ${invoice.sellerDetails.gstin}`);
            }
            doc.text(`State: ${invoice.sellerDetails.state} (${invoice.sellerDetails.stateCode})`);
            doc.moveDown();

            // Buyer Details & Invoice Details
            const startY = doc.y;

            doc.font('Helvetica-Bold').fillColor('#1A1A1A').text('Bill To:', 50, startY);
            doc.font('Helvetica').fillColor('#333333');
            doc.text(invoice.buyerDetails.name, 50, startY + 15);
            doc.text(invoice.buyerDetails.billingAddress, 50, startY + 30, { width: 200 });
            doc.text(`State: ${invoice.buyerDetails.state}`, 50, doc.y);
            doc.text(`State Code: ${invoice.buyerDetails.stateCode}`, 50, doc.y);

            doc.font('Helvetica-Bold').fillColor('#1A1A1A').text('Invoice Details:', 350, startY);
            doc.font('Helvetica').fillColor('#333333');
            doc.text(`Invoice No: ${invoice.invoiceNumber}`, 350, startY + 15);
            doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 350, startY + 30);
            doc.text(`Order ID: ${invoice.orderId}`, 350, startY + 45);

            doc.moveDown(3);

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
                doc.text(item.unitPrice.toFixed(2), 310, position);
                doc.text(item.taxableValue.toFixed(2), 380, position);
                doc.text(item.totalAmount.toFixed(2), 480, position);
                position += 25;
            });

            doc.moveTo(50, position + 5).lineTo(550, position + 5).strokeColor('#E5E7EB').stroke();

            // Summary
            position += 20;
            doc.font('Helvetica').fontSize(9);
            doc.text(`Taxable Value:`, 350, position);
            doc.text(`${invoice.taxSummary.totalTaxableValue.toFixed(2)}`, 480, position);
            position += 15;
            
            if (invoice.taxSummary.totalIGST > 0) {
                doc.text(`IGST:`, 350, position);
                doc.text(`${invoice.taxSummary.totalIGST.toFixed(2)}`, 480, position);
                position += 15;
            } else {
                doc.text(`CGST:`, 350, position);
                doc.text(`${invoice.taxSummary.totalCGST.toFixed(2)}`, 480, position);
                position += 15;
                doc.text(`SGST:`, 350, position);
                doc.text(`${invoice.taxSummary.totalSGST.toFixed(2)}`, 480, position);
                position += 15;
            }

            doc.moveTo(350, position + 5).lineTo(550, position + 5).strokeColor('#E5E7EB').stroke();
            position += 15;

            doc.font('Helvetica-Bold').fontSize(11).fillColor('#1A1A1A');
            doc.text(`Grand Total:`, 350, position);
            doc.text(`INR ${invoice.totalAmount.toFixed(2)}`, 480, position);

            // Amount in words
            doc.moveDown(3);
            doc.font('Helvetica-Bold').fontSize(9).text('Amount in Words:');
            doc.font('Helvetica').text(invoice.amountInWords);
            
            doc.moveDown(4);
            doc.font('Helvetica-Oblique').fontSize(8).fillColor('#9CA3AF').text('This is a computer generated invoice and does not require a physical signature.', { align: 'center' });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', (err) => reject(err));
        });
    }

    private static convertSubThousandToWords(value: number): string {
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
            } else {
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

    private static convertNumberToIndianWords(value: number): string {
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

        const chunks: string[] = [];

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

    private static numberToWords(amount: number): string {
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

    public static async createInvoice(order: IOrder, customer: ICustomer): Promise<IInvoice> {

        // 1. Generate Invoice Number
        const invoiceNumber = await this.generateInvoiceNumber();

        // 2. Determine State Code
        const customerState = customer.state || "Maharashtra";
        const customerStateCode = this.getStateCode(customerState);

        // 3. Calculate Tax
        const { processedItems, taxSummary, totalAmount } = this.calculateTax(order.items, customerStateCode);

        // 3. Prepare Invoice Data
        const invoiceData: Partial<IInvoice> = {
            invoiceNumber,
            orderId: order._id as any,
            customerId: customer._id as any,
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
        const invoice = new Invoice(invoiceData);

        // 5. Generate PDF
        const pdfPath = await this.generatePDF(invoice, order.payment_method);
        invoice.pdfPath = pdfPath;

        await invoice.save();

        return invoice;
    }
}
