import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
    description: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    taxableValue: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalAmount: number;
}

export interface IInvoice extends Document {
    invoiceNumber: string; // INV-YYYY-XXXXX
    orderId: mongoose.Types.ObjectId; // Link to Order
    customerId: mongoose.Types.ObjectId; // Link to Customer
    invoiceDate: Date;

    sellerDetails: {
        name: string;
        gstin: string;
        address: string;
        state: string;
        stateCode: string;
        pan: string;
    };

    buyerDetails: {
        name: string;
        billingAddress: string;
        shippingAddress: string;
        state: string;
        stateCode: string;
        gstin?: string; // Optional for B2C
    };

    items: IInvoiceItem[];

    taxSummary: {
        totalTaxableValue: number;
        totalCGST: number;
        totalSGST: number;
        totalIGST: number;
    };

    totalAmount: number; // Grand Total
    amountInWords: string;

    pdfPath: string; // Path to stored PDF
    status: 'generated' | 'emailed' | 'void';

    createdAt: Date;
    updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
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

const InvoiceSchema: Schema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
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

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
