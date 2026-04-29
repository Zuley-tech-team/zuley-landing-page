import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expires_at: {
            type: Date,
            required: true,
            // MongoDB TTL index: auto-delete expired docs
            index: { expires: 0 },
        },
        used: {
            type: Boolean,
            default: false,
        },
        attempts: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false },
    }
);

export type IOtp = mongoose.InferSchemaType<typeof otpSchema> & { _id: mongoose.Types.ObjectId };
export const Otp = mongoose.model("Otp", otpSchema);
