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

export interface VerifyPaymentPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    order_id?: string;
    invoice?: string;
}

/**
 * Sends the Razorpay callback IDs to the backend for HMAC-SHA256 verification.
 * Must succeed before treating a payment as confirmed on the frontend.
 */
export async function verifyPayment(
    payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/payments/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message || `Payment verification failed (${response.status})`
        );
    }

    return response.json();
}
