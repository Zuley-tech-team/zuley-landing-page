import { API_BASE_URL } from './config';

export interface OrderTrackingItem {
    name: string;
    quantity: number;
    price: number;
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
