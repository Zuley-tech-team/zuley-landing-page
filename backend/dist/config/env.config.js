"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
/**
 * Zod schema for environment variables validation
 * All required environment variables must be defined here
 */
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["staging", "production", "development"])
        .default("development"),
    PORT: zod_1.z.string().transform(Number).default(8000),
    MONGO_URI: zod_1.z.string().min(1, "MONGO_URI is required"),
    FRONTEND_URL: zod_1.z
        .string()
        .url("FRONTEND_URL must be a valid URL")
        .default("http://localhost:5173"),
    RAZORPAY_KEY_ID: zod_1.z.string().min(1, "RAZORPAY_KEY_ID is required"),
    RAZORPAY_KEY_SECRET: zod_1.z.string().min(1, "RAZORPAY_KEY_SECRET is required"),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().min(1, "RAZORPAY_WEBHOOK_SECRET is required"),
    RESEND_API_KEY: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().default("no-reply@zuley.in"),
    JWT_SECRET: zod_1.z.string().min(1, "JWT_SECRET is required"),
});
/**
 * Validate environment variables
 * This will crash the application if any required variable is missing or invalid
 */
function validateEnv() {
    try {
        const parsed = envSchema.safeParse(process.env);
        if (!parsed.success) {
            console.error("Invalid or missing environment variables:\n");
            parsed.error.issues.forEach((issue) => {
                console.error(`  ❌ ${issue.path.join(".")}: ${issue.message}`);
            });
            console.error("\n⚠️  Please check your .env file and ensure all required variables are set correctly.\n");
            process.exit(1);
        }
        return parsed.data;
    }
    catch (error) {
        console.error("\n❌ ENVIRONMENT CONFIGURATION ERROR\n");
        console.error(error);
        process.exit(1);
    }
}
/**
 * Validated and typed environment configuration
 * Import this instead of using process.env directly
 */
exports.env = validateEnv();
// Log successful validation in development
if (exports.env.NODE_ENV === "development") {
    console.log("✓ Environment variables validated successfully");
}
