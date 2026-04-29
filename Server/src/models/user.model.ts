import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."],
        },
        is_profile_complete: {
            type: Boolean,
            default: false,
        },
        last_login: {
            type: Date,
        },
        login_history: [
            {
                type: Date,
            },
        ],
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

export type IUser = mongoose.InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User = mongoose.model("User", userSchema);
