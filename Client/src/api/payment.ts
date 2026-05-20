import { API_BASE_URL } from './config';

export interface CreateOrderPayload {
    amount: number; // in paise
    currency?: string;
    receipt: string;
    notes: Record<string, string>;
}

export interface CreateOrderResponse {
    success: boolean;
    merchant_order_id: string;
    amount: number;
    redirect_url: string;
}

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
    merchant_order_id: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    order_id?: string;
    invoice?: string;
}

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
