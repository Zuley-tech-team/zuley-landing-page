import mongoose, { Schema, Document } from 'mongoose';

export interface IShipping extends Document {
    orderId: mongoose.Types.ObjectId;
    courierName: string;
    trackingNumber: string;
    trackingUrl: string;
    shippedAt: Date;
    deliveredAt?: Date;
    status: 'pending' | 'shipped' | 'in_transit' | 'delivered';
    notes?: string;
    history: {
        status: string;
        timestamp: Date;
        note?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ShippingSchema: Schema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    courierName: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    trackingUrl: { type: String, required: true },
    shippedAt: { type: Date, required: true, default: Date.now },
    deliveredAt: { type: Date },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'in_transit', 'delivered'],
        default: 'shipped' // When created via createShipment, it's usually shipped
    },
    notes: { type: String },
    history: [{
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: String
    }]
}, { timestamps: true });

export const Shipping = mongoose.model<IShipping>('Shipping', ShippingSchema);
