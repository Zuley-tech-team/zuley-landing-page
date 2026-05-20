import { useState, useCallback } from 'react';
import { createPaymentOrder } from '../api/payment';
import type { Product } from '../api/products';

export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
}

export interface ShippingAddress {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
}

interface UsePhonePeParams {
    items: { product: Product; quantity: number, variant_info?: string }[];
    customerInfo: CustomerInfo;
    shippingAddress: ShippingAddress;
    onFailure: (error: string) => void;
}

export function usePhonePe() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiatePayment = useCallback(
        async ({
            items,
            customerInfo,
            shippingAddress,
            onFailure,
        }: UsePhonePeParams) => {
            setIsLoading(true);
            setError(null);

            try {
                const backendItems = items.map(item => ({
                    sku: item.product.sku,
                    name: item.product.name,
                    price: item.product.price, // sending in standard units, backend handles * 100 or already doing * 100?
                    quantity: item.quantity,
                    variant_info: item.variant_info,
                    total_price: item.product.price * item.quantity,
                }));

                const totalAmountPaise = backendItems.reduce((acc, curr) => acc + curr.total_price, 0) * 100;

                const orderData = await createPaymentOrder({
                    amount: totalAmountPaise,
                    currency: 'INR',
                    receipt: `rcpt_${Date.now()}`,
                    notes: {
                        items: JSON.stringify(backendItems),
                        customer_name: customerInfo.name,
                        customer_email: customerInfo.email,
                        customer_phone: customerInfo.phone,
                        shipping_address: JSON.stringify({
                            line1: shippingAddress.line1,
                            line2: shippingAddress.line2,
                            city: shippingAddress.city,
                            state: shippingAddress.state,
                            pincode: shippingAddress.pincode,
                            country: 'India',
                        }),
                    },
                });

                if (orderData.redirect_url) {
                    // Redirect directly to PhonePe payment page
                    window.location.href = orderData.redirect_url;
                } else {
                    throw new Error("Failed to get redirect URL from payment provider.");
                }

            } catch (err: any) {
                const msg = err.message || 'Something went wrong. Please try again.';
                setError(msg);
                onFailure(msg);
                setIsLoading(false);
            }
        },
        []
    );

    const clearError = useCallback(() => setError(null), []);
    return { initiatePayment, isLoading, error, clearError };
}
