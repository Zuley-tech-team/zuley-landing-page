import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Zod schema for environment variables validation
 * All required environment variables must be defined here
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["staging", "production", "development"])
    .default("development"),
  PORT: z.string().transform(Number).default("8000" as any),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  // Accepts a single URL or comma-separated list (e.g. for multi-port local dev)
  FRONTEND_URL: z
    .string()
    .min(1, "FRONTEND_URL is required")
    .default("http://localhost:5173"),

  ENABLE_ONLINE_PAYMENTS: z
    .string()
    .transform((value) => value === "true")
    .default("false" as any),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(""),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("no-reply@zuley.in"),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("zuley/products"),

  INVOICE_SELLER_NAME: z.string().min(1, "INVOICE_SELLER_NAME is required"),
  INVOICE_SELLER_GSTIN: z.string().min(1, "INVOICE_SELLER_GSTIN is required"),
  INVOICE_SELLER_ADDRESS: z.string().min(1, "INVOICE_SELLER_ADDRESS is required"),
  INVOICE_SELLER_STATE: z.string().min(1, "INVOICE_SELLER_STATE is required"),
  INVOICE_SELLER_STATE_CODE: z
    .string()
    .regex(/^\d{2}$/, "INVOICE_SELLER_STATE_CODE must be a 2-digit GST state code"),
  INVOICE_SELLER_PAN: z.string().min(1, "INVOICE_SELLER_PAN is required"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
}).superRefine((value, ctx) => {
  if (!value.ENABLE_ONLINE_PAYMENTS) {
    return;
  }

  if (!value.RAZORPAY_KEY_ID) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["RAZORPAY_KEY_ID"],
      message: "RAZORPAY_KEY_ID is required when ENABLE_ONLINE_PAYMENTS=true",
    });
  }

  if (!value.RAZORPAY_KEY_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["RAZORPAY_KEY_SECRET"],
      message: "RAZORPAY_KEY_SECRET is required when ENABLE_ONLINE_PAYMENTS=true",
    });
  }

  // RAZORPAY_WEBHOOK_SECRET is optional — only needed if using webhook-based order creation.
  // Add it via Razorpay Dashboard > Webhooks once your server is publicly reachable.
  if (!value.RAZORPAY_WEBHOOK_SECRET) {
    console.warn(
      "⚠️  RAZORPAY_WEBHOOK_SECRET is not set. Webhook signature verification will be disabled. " +
      "Client-side verify-payment endpoint will still work normally."
    );
  }
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

      console.error(
        "\n⚠️  Please check your .env file and ensure all required variables are set correctly.\n"
      );
      process.exit(1);
    }

    return parsed.data;
  } catch (error) {
    console.error("\n❌ ENVIRONMENT CONFIGURATION ERROR\n");
    console.error(error);
    process.exit(1);
  }
}

/**
 * Validated and typed environment configuration
 * Import this instead of using process.env directly
 */
export const env = validateEnv();

/**
 * Type-safe environment configuration object
 */
export type Env = z.infer<typeof envSchema>;

// Log successful validation in development
if (env.NODE_ENV === "development") {
  console.log("✓ Environment variables validated successfully");
}
