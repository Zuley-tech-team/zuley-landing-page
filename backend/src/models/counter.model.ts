import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
    _id: string; // The name of the sequence (e.g., 'invoiceNumber')
    seq: number;
}

const CounterSchema: Schema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);
