import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
        },
        last_login: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Method to check password
adminSchema.methods.comparePassword = async function (candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password);
};

export interface IAdmin extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: "admin" | "superadmin";
    last_login?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
