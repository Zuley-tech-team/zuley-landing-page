import { API_BASE_URL } from './config';

export interface ContactInquiryPayload {
  full_name: string;
  email: string;
  phone?: string;
  inquiry_type: 'general' | 'product' | 'order' | 'personalization' | 'corporate' | 'complaint' | 'other';
  order_id?: string;
  message: string;
  source_page?: string;
}

export interface NewsletterPayload {
  email: string;
  source?: string;
}

export interface CorporateLeadPayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  quantity: number;
  product_type: 'silver-pens' | 'silver-phone-covers' | 'mixed';
  expected_timeline?: string;
  message?: string;
  source_page?: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

const parseResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Request failed');
  }

  return body;
};

export async function submitContactInquiry(payload: ContactInquiryPayload): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/engagement/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function subscribeNewsletter(payload: NewsletterPayload): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/engagement/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function submitCorporateLead(payload: CorporateLeadPayload): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/engagement/corporate-leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export interface TestimonialItem {
  name: string;
  city?: string;
  role?: string;
  rating: number;
  quote: string;
}

export async function fetchTestimonials(): Promise<TestimonialItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/engagement/testimonials`);
  const parsed = await parseResponse<TestimonialItem[]>(response);
  return parsed.data || [];
}
