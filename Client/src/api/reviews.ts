import { API_BASE_URL } from './config';
import { getStoredToken } from './auth';

export type ReviewImage = {
  url: string;
  public_id: string;
};

export type ReviewItem = {
  _id: string;
  order_id: string;
  product_sku: string;
  product_name: string;
  product_image?: string;
  customer_name: string;
  customer_city?: string;
  rating: number;
  comment: string;
  images: ReviewImage[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export async function fetchReviews(params?: { product_sku?: string; page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.product_sku) searchParams.set('product_sku', params.product_sku);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/api/v1/reviews${query ? `?${query}` : ''}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load reviews');
  }

  return data as { success: boolean; data: ReviewItem[]; pagination?: any };
}

export async function submitReview(
  payload: {
    order_id: string;
    product_sku: string;
    rating: number;
    comment: string;
    images?: File[];
  },
  onProgress?: (percent: number) => void
) {
  const formData = new FormData();
  formData.append('order_id', payload.order_id);
  formData.append('product_sku', payload.product_sku);
  formData.append('rating', String(payload.rating));
  formData.append('comment', payload.comment);

  if (payload.images?.length) {
    payload.images.forEach((file) => formData.append('images', file));
  }

  const token = getStoredToken();

  return new Promise<{ success: boolean; data: ReviewItem }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/api/v1/user/reviews`);
    xhr.withCredentials = true;
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };

    xhr.onload = () => {
      const responseText = xhr.responseText || '{}';
      const data = JSON.parse(responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as { success: boolean; data: ReviewItem });
      } else {
        reject(new Error(data.message || 'Failed to submit review'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Failed to submit review'));
    };

    xhr.send(formData);
  });
}
