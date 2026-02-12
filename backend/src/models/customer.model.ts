import mongoose from "mongoose";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry"
];

const customerSchema = new mongoose.Schema(
    {
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: false, // Initially might be null until linked
            description: "Link to the order this customer record belongs to"
        },
        full_name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."],
        },
        address_line1: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
        },
        address_line2: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            enum: INDIAN_STATES,
        },
        pincode: {
            type: String,
            required: true,
            match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Pincode."],
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: false }, // Only need created_at
    }
);

export type ICustomer = mongoose.InferSchemaType<typeof customerSchema> & { _id: mongoose.Types.ObjectId };
export const Customer = mongoose.model("Customer", customerSchema);
