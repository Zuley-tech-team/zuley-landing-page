import { API_BASE_URL } from './config';

export interface PublicCoupon {
    id: string;
    code: string;
    name: string;
    description?: string;
    discount_type: 'percentage' | 'flat';
    discount_value: number;
    min_order_value?: number;
    max_discount?: number;
    applies_to_all: boolean;
    applicable_skus: string[];
    usage_limit?: number;
    usage_count?: number;
    starts_at?: string;
    ends_at?: string;
}

export interface CouponValidationResult {
    code: string;
    name: string;
    discount_type: 'percentage' | 'flat';
    discount_value: number;
    discount_amount: number;
    subtotal: number;
    total: number;
}

export async function fetchAvailableCoupons(skus?: string[]): Promise<PublicCoupon[]> {
    const params = new URLSearchParams();
    if (skus && skus.length > 0) {
        params.set('skus', skus.join(','));
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/coupons/available${params.toString() ? `?${params.toString()}` : ''}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Failed to load coupons');
    }

    return data.data || [];
}

export async function validateCouponCode(payload: {
    code: string;
    items: Array<{ sku: string; quantity: number }>;
}): Promise<CouponValidationResult> {
    const response = await fetch(`${API_BASE_URL}/api/v1/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'Failed to validate coupon');
    }

    return data.data as CouponValidationResult;
}
