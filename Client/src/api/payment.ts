import { API_BASE_URL } from './config';

export interface CreateOrderPayload {
    amount: number; // in paise (e.g. 12999 rupees = 1299900 paise)
    currency?: string;
    receipt: string;
    notes: Record<string, string>;
}

export interface CreateOrderResponse {
    success: boolean;
    order_id: string;
    amount: number;
    currency: string;
    key_id: string;
}

/**
 * Calls the backend to create a Razorpay payment order.
 * Amount should be in paise (multiply ₹ price by 100).
 */
export async function createPaymentOrder(
    payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message || `Payment order creation failed (${response.status})`
        );
    }

    return response.json();
}
