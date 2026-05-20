import { API_BASE_URL } from './config';
import { getStoredToken } from './auth';

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
    const token = getStoredToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}/api/v1/orders/${encodeURIComponent(orderId)}/track`,
        { headers, credentials: 'include' }
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

/**
 * Downloads the invoice for an order via our authenticated proxy endpoint.
 * The server fetches from Cloudinary internally and streams the PDF —
 * the client only ever sees zuley.in URLs.
 */
export async function fetchAndDownloadInvoice(orderId: string, invoiceNumber?: string | null): Promise<void> {
    const params = new URLSearchParams();
    if (invoiceNumber) {
        params.set('invoiceNumber', invoiceNumber);
    }
    const query = params.toString();
    const apiUrl = `${API_BASE_URL}/api/v1/orders/${encodeURIComponent(orderId)}/invoice${query ? `?${query}` : ''}`;

    const { getStoredToken } = await import('./auth');
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(apiUrl, { headers, credentials: 'include' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch invoice');
    }

    // Server streams the PDF directly — download as blob
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

/** @deprecated Use fetchAndDownloadInvoice instead */
export async function fetchInvoiceUrl(orderId: string, invoiceNumber?: string | null): Promise<string> {
    const params = new URLSearchParams();
    if (invoiceNumber) {
        params.set('invoiceNumber', invoiceNumber);
    }
    const query = params.toString();
    const apiUrl = `${API_BASE_URL}/api/v1/orders/${encodeURIComponent(orderId)}/invoice${query ? `?${query}` : ''}`;

    const { getStoredToken } = await import('./auth');
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(apiUrl, { headers, credentials: 'include' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch invoice');
    }
    // The server now streams the PDF — we can't return a URL.
    // Callers should migrate to fetchAndDownloadInvoice.
    throw new Error('fetchInvoiceUrl is deprecated. Use fetchAndDownloadInvoice instead.');
}
