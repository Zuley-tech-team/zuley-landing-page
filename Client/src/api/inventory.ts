import { API_BASE_URL } from './config';

export interface StockAvailability {
    sku: string;
    inStock: boolean;
    lowStock: boolean;
}

/**
 * Checks stock availability for a given SKU.
 */
export async function checkStockAvailability(
    sku: string
): Promise<StockAvailability> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/inventory/${encodeURIComponent(sku)}/availability`
        );

        if (!response.ok) {
            // On error, default to "in stock" to not block purchases
            return { sku, inStock: true, lowStock: false };
        }

        const data = await response.json();
        return data.data;
    } catch {
        // Network error - default to "in stock"
        return { sku, inStock: true, lowStock: false };
    }
}
