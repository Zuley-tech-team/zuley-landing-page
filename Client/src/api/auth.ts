import { API_BASE_URL } from './config';

const BASE = `${API_BASE_URL}/api/v1/user`;

// Store token in memory (also stored in httpOnly cookie by server)
let _token: string | null = localStorage.getItem('zuley_user_token');

export function getStoredToken() {
    return _token;
}

function authHeaders(): HeadersInit {
    return _token ? { Authorization: `Bearer ${_token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data as T;
}

export interface AuthUser {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    is_profile_complete: boolean;
}

export interface SendOtpResponse {
    success: boolean;
    is_new_user: boolean;
    message: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    is_new_user: boolean;
    needs_profile: boolean;
    token: string;
    user: AuthUser;
}

export interface OrderItem {
    sku: string;
    name: string;
    quantity: number;
    price: number;
    total_price: number;
    variant_info?: string;
    product_image?: string;
    product_sku?: string;
}

export interface CustomerOrder {
    _id: string;
    order_id: string;
    status: string;
    payment_status: string;
    payment_method: string;
    total_amount: number;
    items_count: number;
    items: OrderItem[];
    shipping_details?: {
        courier_name?: string;
        tracking_number?: string;
        tracking_url?: string;
        shipped_at?: string;
        delivered_at?: string;
    };
    shipping_address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    createdAt: string;
}

export async function sendOtp(email: string): Promise<SendOtpResponse> {
    const res = await fetch(`${BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
    });
    return handleResponse<SendOtpResponse>(res);
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const res = await fetch(`${BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
    });
    const data = await handleResponse<VerifyOtpResponse>(res);
    // Store token for Bearer auth
    if (data.token) {
        _token = data.token;
        localStorage.setItem('zuley_user_token', data.token);
    }
    return data;
}

export async function completeProfile(name: string, phone: string): Promise<{ success: boolean; user: AuthUser }> {
    const res = await fetch(`${BASE}/complete-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify({ name, phone }),
    });
    return handleResponse(res);
}

export async function getMe(): Promise<{ success: boolean; user: AuthUser }> {
    const res = await fetch(`${BASE}/me`, {
        headers: { ...authHeaders() },
        credentials: 'include',
    });
    return handleResponse(res);
}

export async function logoutApi(): Promise<void> {
    await fetch(`${BASE}/logout`, {
        method: 'POST',
        headers: { ...authHeaders() },
        credentials: 'include',
    });
    _token = null;
    localStorage.removeItem('zuley_user_token');
}

export async function getMyOrders(): Promise<{ success: boolean; orders: CustomerOrder[] }> {
    const res = await fetch(`${BASE}/orders`, {
        headers: { ...authHeaders() },
        credentials: 'include',
    });
    return handleResponse(res);
}

export async function downloadMyInvoice(orderId: string): Promise<void> {
    const res = await fetch(`${BASE}/orders/${orderId}/invoice/download`, {
        headers: { ...authHeaders() },
        credentials: 'include',
    });
    
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to download invoice');
    }
    
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
