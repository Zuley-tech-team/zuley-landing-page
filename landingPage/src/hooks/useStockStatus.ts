import { useState, useEffect } from 'react';
import { checkStockAvailability, type StockAvailability } from '../api/inventory';

/**
 * Hook that fetches stock availability for a given product SKU.
 * Returns { inStock, lowStock, isLoading }.
 * Defaults to inStock=true while loading to avoid flash of "out of stock".
 */
export function useStockStatus(sku: string) {
    const [status, setStatus] = useState<StockAvailability>({
        sku,
        inStock: true,
        lowStock: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchStock() {
            setIsLoading(true);
            const result = await checkStockAvailability(sku);
            if (!cancelled) {
                setStatus(result);
                setIsLoading(false);
            }
        }

        fetchStock();
        return () => {
            cancelled = true;
        };
    }, [sku]);

    return { ...status, isLoading };
}
