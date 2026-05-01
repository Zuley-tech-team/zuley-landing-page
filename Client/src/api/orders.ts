import { API_BASE_URL } from './config';

export interface OrderTrackingItem {
    name: string;
    quantity: number;
    price: number;
    variant_info?: string;
}

export interface ShippingInfo {
    courierName: string;
    trackingNumber: string;
    trackingUrl: string;
    status: string;
    shippedAt: string;
    deliveredAt: string | null;
    history: { status: string; timestamp: string; note?: string }[];
}

export interface OrderHistoryEntry {
    status: string;
    changed_by: string;
    timestamp: string;
    reason: string;
}

export interface OrderTrackingData {
    order_id: string;
    status: string;
    payment_method?: 'razorpay' | 'cod';
    payment_status?: string;
    items: OrderTrackingItem[];
    items_count: number;
    total_amount: number;
    shipping_address: {
        city: string;
        state: string;
        pincode: string;
    };
    shipping: ShippingInfo | null;
    history: OrderHistoryEntry[];
    created_at: string;
}

export interface PlaceCodOrderPayload {
    items: Array<{ sku: string; quantity: number; variant_info?: string }>;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    shipping_address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
        country?: string;
    };
    coupon_code?: string;
}

export interface PlaceCodOrderResponse {
    success: boolean;
    message: string;
    data: {
        order_id: string;
        status: string;
        payment_method: 'cod';
        payment_status: string;
        total_amount: number;
        invoice_number: string | null;
    };
}

export interface OrderTrackingResponse {
    success: boolean;
    data: OrderTrackingData;
    message?: string;
}

/**
 * Fetches public order tracking info by order ID.
 */
export async function getOrderTracking(
    orderId: string
): Promise<OrderTrackingResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/orders/${encodeURIComponent(orderId)}/track`
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message || `Order not found (${response.status})`
        );
    }

    return response.json();
}

export async function placeCodOrder(
    payload: PlaceCodOrderPayload
): Promise<PlaceCodOrderResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/cod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `COD order failed (${response.status})`);
    }

    return data;
}

export function getInvoiceDownloadUrl(orderId: string, invoiceNumber?: string | null): string {
    const params = new URLSearchParams();
    if (invoiceNumber) {
        params.set('invoiceNumber', invoiceNumber);
    }

    const query = params.toString();
    return `${API_BASE_URL}/api/v1/orders/${encodeURIComponent(orderId)}/invoice${query ? `?${query}` : ''}`;
}
