import { API_BASE_URL } from './config';

// Admin API utility with authentication
class AdminAPI {
    private baseUrl = `${API_BASE_URL}/api/v1/admin`;

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(data.message || 'Unauthorized');
            }

            throw new Error(data.message || 'Request failed');
        }

        return data;
    }

    // Auth
    async login(email: string, password: string) {
        return this.request<{ success: boolean; admin: any }>('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async logout() {
        return this.request('/logout', { method: 'POST' });
    }

    async getMe() {
        return this.request<{ success: boolean; admin: any }>('/me');
    }

    // Dashboard
    async getDashboardStats() {
        return this.request<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    }

    // Products
    async getProducts(params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        if (params?.category) searchParams.set('category', params.category);
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return this.request<{ success: boolean; data: any[]; pagination: Pagination }>(`/products${query ? `?${query}` : ''}`);
    }

    async getProduct(sku: string) {
        return this.request<{ success: boolean; data: any }>(`/products/${sku}`);
    }

    async createProduct(product: any) {
        return this.request<{ success: boolean; data: any }>('/products', {
            method: 'POST',
            body: JSON.stringify(product),
        });
    }

    async uploadProductImages(files: File[]) {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('images', file);
        });

        const response = await fetch(`${this.baseUrl}/products/images`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload product images');
        }

        return data as { success: boolean; data: Array<{ url: string; publicId: string }>; message: string };
    }

    async updateProduct(sku: string, updates: any) {
        return this.request<{ success: boolean; data: any }>(`/products/${sku}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    async deleteProduct(sku: string) {
        return this.request<{ success: boolean }>(`/products/${sku}`, {
            method: 'DELETE',
        });
    }

    async toggleProductStatus(sku: string) {
        return this.request<{ success: boolean; data: any }>(`/products/${sku}/toggle`, {
            method: 'PATCH',
        });
    }

    // Orders
    async getOrders(params?: { page?: number; limit?: number; search?: string; status?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return this.request<{ success: boolean; data: any[]; pagination: Pagination }>(`/orders${query ? `?${query}` : ''}`);
    }

    async getOrder(orderId: string) {
        return this.request<{ success: boolean; data: any }>(`/orders/${orderId}`);
    }

    async updateOrderStatus(orderId: string, status: string, note?: string) {
        return this.request<{ success: boolean; data: any }>(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, note }),
        });
    }

    async acceptReturnRequest(orderId: string, note?: string) {
        return this.request<{ success: boolean; data: any }>(`/orders/${orderId}/return/accept`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    }

    async rejectReturnRequest(orderId: string, note?: string) {
        return this.request<{ success: boolean; data: any }>(`/orders/${orderId}/return/reject`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    }

    async markReturnRefunded(orderId: string, note?: string) {
        return this.request<{ success: boolean; data: any }>(`/orders/${orderId}/return/refunded`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    }

    async markReturnReplaced(orderId: string, note?: string) {
        return this.request<{ success: boolean; data: any }>(`/orders/${orderId}/return/replaced`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    }

    async confirmOrder(orderId: string, note?: string) {
        return this.request<{ success: boolean; data: any; message?: string }>(`/orders/${orderId}/confirm`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    }

    async markCodPaymentCollected(orderId: string, note?: string) {
        return this.request<{ success: boolean; data: any; message?: string }>(`/orders/${orderId}/mark-cod-paid`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    }

    async getOrderInvoice(orderId: string) {
        return this.request<{ success: boolean; data: any }>(`/orders/${orderId}/invoice`);
    }

    getOrderInvoiceDownloadUrl(orderId: string) {
        return `${this.baseUrl}/orders/${encodeURIComponent(orderId)}/invoice/download`;
    }

    async shipOrder(payload: {
        orderId: string;
        courierName: string;
        trackingNumber: string;
        trackingUrl?: string;
        notes?: string;
    }) {
        const response = await fetch(`${API_BASE_URL}/api/v1/shipping/ship`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to mark order as shipped');
        }

        return data as { status: boolean; data: any };
    }

    async updateShipment(payload: {
        orderId: string;
        courierName: string;
        trackingNumber: string;
        trackingUrl?: string;
        notes?: string;
    }) {
        const response = await fetch(`${API_BASE_URL}/api/v1/shipping/update`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to update shipment');
        }

        return data as { status: boolean; data: any };
    }

    async markDelivered(orderId: string, notes?: string) {
        const response = await fetch(`${API_BASE_URL}/api/v1/shipping/deliver`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, notes }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to mark order as delivered');
        }

        return data as { status: boolean; data: any };
    }

    // Reviews
    async getReviews(params?: { page?: number; limit?: number; status?: string; search?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.status) searchParams.set('status', params.status);
        if (params?.search) searchParams.set('search', params.search);

        const query = searchParams.toString();
        return this.request<{ success: boolean; data: any[]; pagination: Pagination }>(`/reviews${query ? `?${query}` : ''}`);
    }

    async approveReview(reviewId: string) {
        return this.request<{ success: boolean; data: any }>(`/reviews/${reviewId}/approve`, {
            method: 'PATCH',
        });
    }

    async rejectReview(reviewId: string) {
        return this.request<{ success: boolean; data: any }>(`/reviews/${reviewId}/reject`, {
            method: 'PATCH',
        });
    }

    // Inventory
    async getInventory(params?: { page?: number; limit?: number; search?: string; status?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return this.request<{ success: boolean; data: any[]; pagination: Pagination }>(`/inventory${query ? `?${query}` : ''}`);
    }

    async updateStock(sku: string, quantity: number, reason?: string, lowStockThreshold?: number) {
        return this.request<{ success: boolean; data: any }>('/inventory/stock', {
            method: 'POST',
            body: JSON.stringify({ sku, quantity, reason, lowStockThreshold }),
        });
    }

    // Engagement
    async getEngagementStats() {
        return this.request<{ success: boolean; data: any }>('/engagement/stats');
    }

    async getContactInquiries(params?: { page?: number; limit?: number; search?: string; status?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return this.request<{ success: boolean; data: any[]; pagination: Pagination }>(`/engagement/contact-inquiries${query ? `?${query}` : ''}`);
    }

    async updateContactInquiryStatus(id: string, status: string) {
        return this.request<{ success: boolean; data: any }>(`/engagement/contact-inquiries/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getCorporateLeads(params?: { page?: number; limit?: number; search?: string; status?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return this.request<{ success: boolean; data: any[]; pagination: Pagination }>(`/engagement/corporate-leads${query ? `?${query}` : ''}`);
    }

    async updateCorporateLeadStatus(id: string, status: string) {
        return this.request<{ success: boolean; data: any }>(`/engagement/corporate-leads/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    async getNewsletterSubscribers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);
        if (params?.status) searchParams.set('status', params.status);

        const query = searchParams.toString();
        return this.request<{ success: boolean; data: any[]; pagination: Pagination }>(`/engagement/newsletter-subscribers${query ? `?${query}` : ''}`);
    }

    // Users (Leads)
    async getUsers(params?: { page?: number; limit?: number; search?: string }) {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.search) searchParams.set('search', params.search);

        const query = searchParams.toString();
        return this.request<{ success: boolean; data: any[]; pagination: Pagination }>(`/users${query ? `?${query}` : ''}`);
    }

    async getUserDetails(id: string) {
        return this.request<{ success: boolean; data: any }>(`/users/${id}`);
    }
}

export interface DashboardStats {
    products: { total: number };
    orders: { total: number; pending: number; shipped: number; delivered: number };
    revenue: number;
    lowStockAlerts: { sku: string; quantity: number; threshold: number }[];
    recentOrders: any[];
}

export interface Pagination {
    current: number;
    total: number;
    count: number;
}

export const adminAPI = new AdminAPI();
