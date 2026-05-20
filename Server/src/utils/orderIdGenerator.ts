import { randomBytes } from "crypto";

/**
 * Generates a human-readable, non-sequential Order ID
 * Format: ZUL-XXXXXX (where X is an uppercase alphanumeric character)
 * Using 6 characters provides ~2.1 billion combinations, 
 * which is plenty for order collision avoidance while keeping it short and readable.
 */
export const generateOrderId = async (): Promise<string> => {
    // Generate 4 bytes of random data, which gives us 8 hex chars.
    // We convert to uppercase and slice the first 6 characters to keep it short and punchy.
    // We replace 0 and O, 1 and I to avoid customer reading confusion.
    let randomString = "";
    while (randomString.length < 6) {
        const char = randomBytes(1).toString("hex").toUpperCase();
        // Filter out confusing characters (0, O, 1, I)
        if (!["0", "O", "1", "I"].includes(char[0])) {
            randomString += char[0];
        }
    }

    return `ZUL-${randomString}`;
};
