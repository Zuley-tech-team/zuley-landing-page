import { API_BASE_URL } from './config';

export type ProductCategory = 'silver-pens' | 'silver-phone-covers'; // silver-phone-covers is legacy, kept for DB compat

export interface ProductSpecifications {
    material: string;
    weight?: string;
    dimensions?: string;
    warranty?: string;
    [key: string]: string | undefined;
}

export interface Product {
    _id: string;
    sku: string;
    name: string;
    category: ProductCategory;
    categoryLabel: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    description: string;
    longDescription?: string;
    badge?: 'Bestseller' | 'New' | 'Limited Edition';
    features?: string[];
    specifications?: ProductSpecifications;
    isActive: boolean;
}

export interface Category {
    slug: ProductCategory;
    label: string;
}

/**
 * Fetches all products from the API
 */
export async function fetchProducts(params?: {
    category?: ProductCategory;
    badge?: string;
    limit?: number;
}): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.badge) searchParams.set('badge', params.badge);
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/v1/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch products (${response.status})`);
    }

    const data = await response.json();
    return data.data;
}

/**
 * Fetches a single product by SKU
 */
export async function fetchProductBySku(sku: string): Promise<Product | null> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${encodeURIComponent(sku)}`);

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Failed to fetch product (${response.status})`);
    }

    const data = await response.json();
    return data.data;
}

/**
 * Fetches products by category
 */
export async function fetchProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return fetchProducts({ category });
}

/**
 * Fetches related products for a given SKU
 */
export async function fetchRelatedProducts(sku: string, limit: number = 4): Promise<Product[]> {
    const response = await fetch(
        `${API_BASE_URL}/api/v1/products/${encodeURIComponent(sku)}/related?limit=${limit}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch related products (${response.status})`);
    }

    const data = await response.json();
    return data.data;
}

/**
 * Fetches all categories
 */
export async function fetchCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/meta/categories`);

    if (!response.ok) {
        throw new Error(`Failed to fetch categories (${response.status})`);
    }

    const data = await response.json();
    return data.data;
}
